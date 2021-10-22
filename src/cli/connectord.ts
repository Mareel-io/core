import { ControllerFactory as EFMControllerFactory } from '../driver/efm/lib';
import { CiscoCredential, ControllerFactory as CiscoControllerFactory } from '../driver/cisco/lib';
import { ControllerFactory as GenericControllerFactory } from '../driver/generic/lib';
import { ControllerFactory as DummyControllerFactory } from '../driver/dummy/lib';
import WebSocket from 'ws'
import arg from 'arg';

import { CiscoTFTPServer } from '../util/tftp';
import { SvcRunner } from '../util/svcrunner';
import path from 'path';

import fs from 'fs';

import YAML from 'yaml';
import { MethodNotAvailableError, RPCProvider, RPCReturnType, RPCv2Request } from '../connector/jsonrpcv2';
import { SwitchConfiguratorReqHandler } from '../connector/requesthandler/SwitchConfigurator';
import { WLANConfiguratorReqHandler } from '../connector/requesthandler/WLANConfigurator';
import { FirewallConfiguratorReqHandler } from '../connector/requesthandler/FirewallConfigurator';
import { LogmanReqHandler } from '../connector/requesthandler/Logman';
import { MarilError, MarilRPCTimeoutError, MethodNotImplementedError } from '../error/MarilError';
import { WLANUserDeviceStatReqHandler } from '../connector/requesthandler/WLANUserDeviceStat';
import { SwitchQoSReqHandler } from '../connector/requesthandler/SwitchQoS';
import { RouteConfiguratorReqHandler } from '../connector/requesthandler/RouteConfigurator';
import { ConnectorClientConfig, ConnectorDevice } from '../types/lib';
import { logger } from '../util/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compareObject (o1: {[key: string]: any}, o2: {[key: string]: any}){
    for(const p in o1){
        if(Object.prototype.hasOwnProperty.call(o1, p)){
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
    for(const p in o2){
        if(Object.prototype.hasOwnProperty.call(o2, p)){
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
    return true;
}

function compareConfig (c1: {[key: string]: ConnectorDevice}, c2: {[key: string]: ConnectorDevice}) {
    const k1 = Object.keys(c1);
    const k2 = Object.keys(c2);

    const maxlen = k1.length > k2.length ? k1.length : k2.length;

    for(let i = 0; i < maxlen; i++) {
        if (k1[i] !== k2[i]) {
            return false;
        }
    }

    return true;
}

export async function svcmain() {
    const args = arg({
        '--config': String,
        '--devicedb': String,
    });

    const config = args['--config'] ? args['--config'] : '/etc/mareel/connectord.yaml';
    const configFile = YAML.parse(fs.readFileSync(config).toString('utf-8'));
    const deviceDB = args['--devicedb'] ? args['--devicedb'] : configFile.devicedb;

    if (deviceDB != null) {
        // Separated devicedb file, if not exist, create one.
        if(!fs.existsSync(deviceDB)) {
            fs.writeFileSync(deviceDB, '[]');
        }
        const devicedbFile = JSON.parse(fs.readFileSync(deviceDB).toString('utf-8'));
        configFile.devices = devicedbFile;
    }

    // Initialize essential services
    logger.info('Main process started');
    const connectorClient = new ConnectorClient(configFile, deviceDB);

    process.on('uncaughtException', (e) => {
        logger.log('crit', 'Uncaught exception occured');
        logger.log('crit', e);

        connectorClient.stopSvcs();
        // TODO: Handle error and use proper exit code
        process.exit(-1);
    });

    process.on('unhandledRejection', (e) => {
        logger.log('crit', 'Unhandled rejection occured');
        logger.log('crit', e);

        connectorClient.stopSvcs();
        // TODO: Handle error and use proper exit code
        process.exit(-1);
    });

    process.on('exit', (e) => {
        connectorClient.stopSvcs();
    });

    await connectorClient.startSvcs();
    logger.info('Service started.');

    await connectorClient.initializeConfigurator();
    logger.info('Configurator initialized');
    await connectorClient.connect();
    logger.info('Connected.');
}

export class ConnectorClient {
    private config: ConnectorClientConfig;
    private devicedb: string | null;
    private tftp: CiscoTFTPServer;
    private ciscoCfgSvcRunner: SvcRunner;
    private controllerFactoryTable: {[key: string]: {device: ConnectorDevice, controllerFactory: GenericControllerFactory}} = {};
    private rpc: RPCProvider | null = null;
    private client: WebSocket | null = null;
    private deviceMap: {[key: string]: ConnectorDevice} = {};
    private devices: ConnectorDevice[];
    private needDeviceUpdate = false;

    constructor(config: ConnectorClientConfig, devicedb: string | null) {
        this.config = config;
        this.devicedb = devicedb;
        this.devices = [];

        if (config.client == null) config.client = {
            timeout: {
                callTimeout: 30000,
                pingTimeout: 10000,
            }
        };

        if (devicedb != null) {
            const deviceDbFile = fs.readFileSync(devicedb).toString('utf-8');
            this.devices = JSON.parse(deviceDbFile);
        }

        // Convert devices into map
        if (this.devices == null) this.devices = [];
        this.deviceMap = this.devices.reduce((obj, elem) => {
            obj[elem.id] = elem;
            return obj;
        }, {} as {[key: string]: any});

        // Essential services
        this.tftp = new CiscoTFTPServer(config.tftpserver.hostip);
        const launcherPath = path.join(__dirname, '../../ciscocfg/launcher.sh');
        this.ciscoCfgSvcRunner = new SvcRunner(launcherPath);
    }

    private handleDriverInitError(device: string, feature: string, e: MethodNotImplementedError | Error): void {
        if (e instanceof MethodNotImplementedError) {
            logger.info(`Device ${device} does not support feature: ${feature}`);
        } else {
            throw e;
        }
    }

    public async startSvcs(): Promise<void> {
        if (!this.config.client.disableTFTPDaemon) {
            this.tftp.listen();
        }
        if (!this.config.client.disableCiscoConfigDaemon) {
            await this.ciscoCfgSvcRunner.start();
        }
    }

    public async stopSvcs(): Promise<void> {
        if (!this.config.client.disableTFTPDaemon) {
            this.tftp.close();
        }
        if (!this.config.client.disableCiscoConfigDaemon) {
            await this.ciscoCfgSvcRunner.stop();
        }
    }

    public async connect(): Promise<void> {
        if (this.client != null) return;
        logger.info(`Connecting to target: ${this.config.remote.url}`);
        this.client = new WebSocket(this.config.remote.url, {
            handshakeTimeout: this.config.client.timeout.pingTimeout,
            headers: {
                // TODO: FIXME: Follow server-side auth
                Authorization: ` Token ${this.config.remote.token}`
            }
        });

        this.rpc = await (new Promise((ful, rej) => {
            this.client?.on('open', () => {
                this.client?.removeAllListeners('open');
                //ful(rpc);
            });
            const rpc = new RPCProvider(this.client!, this.config.client.timeout.callTimeout);
            const timer = setTimeout(() => {
                rej(new MarilRPCTimeoutError('Timed out!'));
            }, this.config.client.timeout.callTimeout);
            rpc.addRequestHandler(async (req: RPCv2Request): Promise<RPCReturnType<any>> => {
                clearTimeout(timer);
                if (req.class != 'hwconfig' || req.method != 'updateConfig') {
                    return {handled: false, result: null};
                }

                const configs = (req.params as unknown[])[0] as ConnectorDevice[];

                const oldMap = this.deviceMap;
                this.devices = configs;
                this.deviceMap = configs.reduce((obj, elem) => {
                    obj[elem.id] = elem;
                    return obj;
                }, {} as {[key: string]: any});

                if (!compareConfig(oldMap, this.deviceMap)) {
                    const deviceFile = JSON.stringify(configs);

                    if (this.devicedb != null) {
                        await fs.promises.writeFile(this.devicedb, deviceFile);
                        this.needDeviceUpdate = true;
                    }

                    // TODO: Fix this ugly solution
                    setTimeout(() => {
                        ful(rpc);
                    }, 1000);
                    return {
                        handled: true,
                        result: {
                            reboot: true,
                        }
                    }
                }

                ful(rpc);
                return {
                    handled: true,
                    result: {
                        reboot: false
                    },
                };
            });
        }) as Promise<RPCProvider>);

        logger.info('Connected!');

        if (this.needDeviceUpdate) {
            // End daemon. Let the OpenWRT subsystem respawn this daemon
            logger.info('EXIT!!');
            process.exit(0);
        }

        // Heartbeat
        setInterval(async () => {
            try {
                await this.rpc?.remoteCall({
                    jsonrpc: '2.0',
                    class: 'base',
                    method: 'ping',
                    params: [],
                }, 5000);
            } catch(e) {
                logger.error('Heart stopped!!!');
                process.exit(1);
            }
        }, this.config.client.timeout.pingTimeout)

        await this.registerRPCHandlers();
        this.rpc.remoteNotify({
            jsonrpc: '2.0',
            method: 'clientInit',
            params: [],
        });
    }

    public async registerRPCHandlers(): Promise<void> {
        if (this.rpc == null) {
            throw new Error('You have to connect to RPC first!');
        }

        this.rpc.addRequestHandler(this.deviceInfoRPCRequestHandler.bind(this));

        for(const id of Object.keys(this.controllerFactoryTable)) {
            const controllerFactoryEnt = this.controllerFactoryTable[id];

            const genericControllerFactory: GenericControllerFactory = controllerFactoryEnt.controllerFactory;
            await genericControllerFactory.authenticate(controllerFactoryEnt.device.credential as CiscoCredential);

            // Switch
            try {
                const switchReqHandler = new SwitchConfiguratorReqHandler(id, genericControllerFactory.getSwitchConfigurator());
                await switchReqHandler.init();
                this.rpc.addRequestHandler(switchReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'switch', e as Error);
            }

            // SwitchQoS
            try {
                const switchQoSReqHandler = new SwitchQoSReqHandler(id, genericControllerFactory.getSwitchQoS());
                await switchQoSReqHandler.init();
                this.rpc.addRequestHandler(switchQoSReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'SwithcQoS', e as Error);
            }

            // WLAN
            try {
                const wlanReqHandler = new WLANConfiguratorReqHandler(id, genericControllerFactory.getWLANConfigurator());
                await wlanReqHandler.init();
                this.rpc.addRequestHandler(wlanReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'WLAN', e as Error);
            }

            // Firewall
            try {
                const firewallReqHandler = new FirewallConfiguratorReqHandler(id, genericControllerFactory.getFirewallConfigurator());
                await firewallReqHandler.init();
                this.rpc.addRequestHandler(firewallReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'firewall', e as Error);
            }

            // Logman
            try {
                const logmanReqHandler = new LogmanReqHandler(id, genericControllerFactory.getLogman());
                await logmanReqHandler.init();
                this.rpc.addRequestHandler(logmanReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'logman', e as Error);
            }

            // WLANUserDeviceStat
            try {
                const wlanUserDeviceStatReqHandler = new WLANUserDeviceStatReqHandler(id, genericControllerFactory.getWLANUserDeviceStat());
                await wlanUserDeviceStatReqHandler.init();
                this.rpc.addRequestHandler(wlanUserDeviceStatReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'WLANUserDeviceStat', e as Error);
            }

            // Route
            try {
                const routeReqHandler = new RouteConfiguratorReqHandler(id, genericControllerFactory.getRouteConfigurator());
                await routeReqHandler.init();
                this.rpc.addRequestHandler(routeReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'RouteConfigurator', e as Error);
            }
        }
    }

    private async deviceInfoRPCRequestHandler(req: RPCv2Request): Promise<RPCReturnType<{id: string, type: string}[]>> {
        if (req.class != null || req.target != null) {
            return {
                handled: false,
                result: null,
            };
        }

        switch (req.method) {
            case 'getRegisteredDevices':
            return {
                handled: true,
                result: Object.keys(this.controllerFactoryTable).filter((elem) => {
                    return this.controllerFactoryTable[elem].controllerFactory != null;
                }).map((k) => {
                    const dev = this.controllerFactoryTable[k].device;
                    return {
                        id: dev.id,
                        type: dev.type,
                    };
                }),
            };
            default:
            return {
                handled: false,
                result: null,
            };
        }
    }
    
    public async disconnect(): Promise<void> {
        if (this.client == null) return;
        this.client.close();
        this.client = null;
        this.rpc = null;
        // TODO: Remove all handler from RPC
    }
    
    public async initializeConfigurator(): Promise<void> {
        for (const device of this.devices) {
            let controllerfactory: GenericControllerFactory | null = null;

            try {
                logger.info(`Initializing device ${device.type} - ${device.id}`);
                switch (device.type) {
                    case 'efm':
                    controllerfactory = new EFMControllerFactory(device.addr);
                    break;
                    case 'cisco':
                    controllerfactory = new CiscoControllerFactory(
                        device.addr,
                        './mibjson/cisco.json',
                        this.tftp,
                    );
                    break;
                    case 'dummy':
                        controllerfactory = new DummyControllerFactory(device.addr);
                        break;
                    default:
                        throw new MarilError(`Unsupported device type ${device.type}`)
                }

                await controllerfactory.init();
                // Let's test-authenticate it
                await controllerfactory.authenticate(device.credential);
                logger.info('Device successfully initialized');
            } catch (e) {
                logger.warn(`Failed to initialize device ${device.id}`);
                logger.warn(e);
            }

            this.controllerFactoryTable[device.id] = {
                device: device,
                controllerFactory: controllerfactory as GenericControllerFactory,
            };
        }
    }

    public async getControllerFactory(id: string): Promise<GenericControllerFactory> {
        const controllerFactoryTableEnt = this.controllerFactoryTable[id];
        if (controllerFactoryTableEnt == null) {
            throw new Error('Entity not available');
        }

        await controllerFactoryTableEnt.controllerFactory.authenticate(controllerFactoryTableEnt.device.credential);
        return controllerFactoryTableEnt.controllerFactory;
    }
}

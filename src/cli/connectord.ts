import { ControllerFactory as EFMControllerFactory } from '../driver/efm/lib';
import { CiscoCredential, ControllerFactory as CiscoControllerFactory } from '../driver/cisco/lib';
import { ControllerFactory as GenericControllerFactory } from '../driver/generic/lib';
import { ControllerFactory as DummyControllerFactory } from '../driver/dummy/lib';
import WebSocket from 'ws'
import arg from 'arg';

import { MIBLoader } from '../util/snmp/mibloader';
import { CiscoTFTPServer } from '../util/tftp';
import { SvcRunner } from '../util/svcrunner';
import path from 'path';

import fs from 'fs';

import YAML from 'yaml';
import { MethodNotAvailableError, RPCProvider, RPCReturnType, RPCv2Request } from '../connector/jsonrpcv2';
import { SwitchConfiguratorReqHandler } from '../connector/requesthandler/SwitchConfigurator';
import { WLANConfiguratorReqHandler } from '../connector/requesthandler/WLANConfigurator';
import { collapseTextChangeRangesAcrossMultipleVersions, parseJsonConfigFileContent } from 'typescript';
import { SwitchConfigurator } from '../driver/generic/SwitchConfigurator';
import { FirewallConfiguratorReqHandler } from '../connector/requesthandler/FirewallConfigurator';
import { LogmanReqHandler } from '../connector/requesthandler/Logman';
import { MarilError, MethodNotImplementedError } from '../error/MarilError';
import { WLANUserDeviceStatReqHandler } from '../connector/requesthandler/WLANUserDeviceStat';

interface EFMCredential {
    id: string,
    pass: string,
}

interface ConnectorDevice {
    id: string,
    addr: string,
    type: 'efm' | 'cisco' | 'dummy',
    credential: EFMCredential | CiscoCredential,
}

interface ConnectorClientConfig {
    client: {
        disableCiscoConfigDaemon?: boolean,
        disableTFTPDaemon?: boolean,
    },
    remote: {
        token: string,
        url: string,
    },
    tftpserver: {
        hostip: string,
    },
    devices: ConnectorDevice[],
}

function setupCleanup() {
    //
}

export async function svcmain() {
    const args = arg({
        '--config': String,
        '--devicedb': String,
    });

    const config = args['--config'] ? args['--config'] : '/etc/mareel/connectord.yaml';
    const configFile = YAML.parse(fs.readFileSync(config).toString('utf-8'));
    const deviceDB = args['--devicedb'] ? args['--devicedb'] : null;

    if (deviceDB != null) {
        // Separated devicedb file, if not exist, create one.
        if(!fs.existsSync(deviceDB)) {
            fs.writeFileSync(deviceDB, '[]');
        }
        const devicedbFile = JSON.parse(fs.readFileSync(deviceDB).toString('utf-8'));
        configFile.devices = devicedbFile;
    }

    // Initialize essential services
    console.log('Main process started');
    const connectorClient = new ConnectorClient(configFile, deviceDB);

    process.on('uncaughtException', (e) => {
        console.error('Uncaught exception occured');
        console.error(e);

        connectorClient.stopSvcs();
        // TODO: Handle error and use proper exit code
        process.exit(-1);
    });

    process.on('unhandledRejection', (e) => {
        console.error('Unhandled rejection occured');
        console.error(e);

        connectorClient.stopSvcs();
        // TODO: Handle error and use proper exit code
        process.exit(-1);
    });

    process.on('exit', (e) => {
        connectorClient.stopSvcs();
    });

    await connectorClient.startSvcs();
    console.log('Service started.');

    await connectorClient.initializeConfigurator();
    console.log('Configurator initialized');
    await connectorClient.connect();
    console.log('Connected.');
}

export class ConnectorClient {
    private config: ConnectorClientConfig;
    private devicedb: string | null;
    private tftp: CiscoTFTPServer;
    private ciscoCfgSvcRunner: SvcRunner;
    private controllerFactoryTable: {[key: string]: {device: ConnectorDevice, controllerFactory: GenericControllerFactory}} = {};
    private rpc: RPCProvider | null = null;
    private client: WebSocket | null = null;

    constructor(config: ConnectorClientConfig, devicedb: string | null) {
        this.config = config;
        this.devicedb = devicedb;
        if (config.client == null) config.client = {};
        // Essential services
        this.tftp = new CiscoTFTPServer(config.tftpserver.hostip);
        const launcherPath = path.join(__dirname, '../../ciscocfg/launcher.sh');
        this.ciscoCfgSvcRunner = new SvcRunner(launcherPath);
    }

    private handleDriverInitError(device: string, feature: string, e: MethodNotImplementedError | Error): void {
        if (e instanceof MethodNotImplementedError) {
            console.log(`Device ${device} does not support feature: ${feature}`);
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
        this.client = new WebSocket(this.config.remote.url, {
            headers: {
                // TODO: FIXME: Follow server-side auth
                Authorization: ` Token ${this.config.remote.token}`
            }
        });

        await new Promise((ful) => {
            this.client?.on('open', () => {
                this.client?.removeAllListeners('open');
                ful(null);
            });
        });
        this.rpc = new RPCProvider(this.client);
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
                this.handleDriverInitError(id, 'switch', e);
            }

            // WLAN
            try {
                const wlanReqHandler = new WLANConfiguratorReqHandler(id, genericControllerFactory.getWLANConfigurator());
                await wlanReqHandler.init();
                this.rpc.addRequestHandler(wlanReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'WLAN', e);
            }

            // Firewall
            try {
                const firewallReqHandler = new FirewallConfiguratorReqHandler(id, genericControllerFactory.getFirewallConfigurator());
                await firewallReqHandler.init();
                this.rpc.addRequestHandler(firewallReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'firewall', e);
            }

            // Logman
            try {
                const logmanReqHandler = new LogmanReqHandler(id, genericControllerFactory.getLogman());
                await logmanReqHandler.init();
                this.rpc.addRequestHandler(logmanReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'logman', e);
            }

            // WLANUserDeviceStat
            try {
                const wlanUserDeviceStatReqHandler = new WLANUserDeviceStatReqHandler(id, genericControllerFactory.getWLANUserDeviceStat());
                await wlanUserDeviceStatReqHandler.init();
                this.rpc.addRequestHandler(wlanUserDeviceStatReqHandler.getRPCHandler());
            } catch(e) {
                this.handleDriverInitError(id, 'WLANUserDeviceStat', e);
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
        for (const device of this.config.devices) {
            let controllerfactory: GenericControllerFactory | null = null;

            try {
                console.log(`Initializing device ${device.type} - ${device.id}`);
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
                console.log('Device successfully initialized');
            } catch (e) {
                console.warn(`Failed to initialize device ${device.id}`);
                console.warn(e);
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

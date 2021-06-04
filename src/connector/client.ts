import { ControllerFactory as EFMControllerFactory } from '../driver/efm/lib';
import { CiscoCredential, ControllerFactory as CiscoControllerFactory } from '../driver/cisco/lib';
import { ControllerFactory as GenericControllerFactory } from '../driver/generic/lib';
import { VLAN as GenericVLAN } from '../driver/generic/VLAN';
import WebSocket from 'ws';

import { MIBLoader } from '../util/snmp/mibloader';
import { CiscoTFTPServer } from '../util/tftp';
import { SvcRunner } from '../util/svcrunner';
import path from 'path';

import fs from 'fs';

import YAML from 'yaml';
import { RPCProvider } from './jsonrpcv2';
import { SwitchConfiguratorReqHandler as CiscoSwitchConfiguratorReqHandler } from './requesthandler/cisco/SwitchConfigurator';

const configFile = YAML.parse(fs.readFileSync('./config.yaml').toString('utf-8'));

interface EFMCredential {
    id: string,
    pass: string,
}

interface ConnectorDevice {
    id: string,
    addr: string,
    type: 'efm' | 'cisco',
    credential: EFMCredential | CiscoCredential,
}

interface ConnectorClientConfig {
    remote: {
        token: string,
        url: string,
    },
    tftpserver: {
        hostip: string,
    },
    devices: ConnectorDevice[],
}

async function svcmain() {
    // Initialize essential services
    const connectorClient = new ConnectorClient(configFile);
    await connectorClient.startSvcs();
    connectorClient.initializeConfigurator();
    await connectorClient.connect();
}

export {svcmain};

export class ConnectorClient {
    private config: ConnectorClientConfig;
    private tftp: CiscoTFTPServer;
    private ciscoCfgSvcRunner: SvcRunner;
    private controllerFactoryTable: {[key: string]: {device: ConnectorDevice, controllerFactory: GenericControllerFactory}} = {};
    private rpc: RPCProvider | null = null;
    private client: WebSocket | null = null;

    constructor(config: ConnectorClientConfig) {
        this.config = config;
        // Essential services
        this.tftp = new CiscoTFTPServer(config.tftpserver.hostip);
        const launcherPath = path.join(__dirname, '../../ciscocfg/launcher.sh');
        this.ciscoCfgSvcRunner = new SvcRunner(launcherPath);
    }

    async startSvcs() {
        this.tftp.listen();
        await this.ciscoCfgSvcRunner.start();
    }

    async endSvcs() {
        this.tftp.close();
        await this.ciscoCfgSvcRunner.stop();
    }

    async connect() {
        if (this.client != null) return;
        this.client = new WebSocket(this.config.remote.url, {
            headers: {
                // TODO: FIXME: Follow server-side auth
                Authorization: ` Token ${this.config.remote.token}`
            }
        });
        const stream = WebSocket.createWebSocketStream(this.client, {encoding: 'utf-8'});
        this.rpc = new RPCProvider(stream);
        this.registerRPCHandlers();
    }

    public registerRPCHandlers() {
        if (this.rpc == null) {
            throw new Error('You have to connect to RPC first!');
        }

        for(const id of Object.keys(this.controllerFactoryTable)) {
            const controllerFactoryEnt = this.controllerFactoryTable[id];

            if (controllerFactoryEnt.controllerFactory instanceof CiscoControllerFactory) {
                const ciscoControllerFactory: CiscoControllerFactory = controllerFactoryEnt.controllerFactory;
                ciscoControllerFactory.authenticate(controllerFactoryEnt.device.credential as CiscoCredential);
                const reqHandlerObj = new CiscoSwitchConfiguratorReqHandler(id, ciscoControllerFactory.getSwitchConfigurator());

                this.rpc.addRequestHandler(reqHandlerObj.getRPCHandler());
            }
        }
    }

    async disconnect() {
        if (this.client == null) return;
        this.client.close();
        this.client = null;
        this.rpc = null;
        // TODO: Remove all handler from RPC
    }

    initializeConfigurator() {
        for (const device of this.config.devices) {
            let controllerfactory: GenericControllerFactory | null = null;

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
            }

            this.controllerFactoryTable[device.id] = {
                device: device,
                controllerFactory: controllerfactory as GenericControllerFactory,
            };
        }

    }

    getControllerFactory(id: string): GenericControllerFactory {
        const controllerFactoryTableEnt = this.controllerFactoryTable[id];
        if (controllerFactoryTableEnt == null) {
            throw new Error('Entity not available');
        }

        controllerFactoryTableEnt.controllerFactory.authenticate(controllerFactoryTableEnt.device.credential);
        return controllerFactoryTableEnt.controllerFactory;
    }
}
import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { RPCProvider, RPCv2Request } from '../jsonrpcv2';
import { RPCSwitchConfigurator } from "./SwitchConfigurator";

export class RPCControllerFactory extends GenericControllerFactory {
    private ws: WebSocket;
    private rpc: RPCProvider;
    private devices: {id: string, type: string}[] | null = null;

    constructor(ws: WebSocket) {
        super('');
        this.ws = ws;
        this.rpc = new RPCProvider(this.ws);
    }

    /**
     * Dummy function. it is okay to call this (for API similarity)
     * but not necessary
     */
    public async authenticate(): Promise<void> {
        // Do nothing
    }

    /**
     * Initialize the RPCControllerFactory
     */
    public async init(): Promise<void> {
        await new Promise((ful, _rej) => {
            const cb = async (notify: RPCv2Request): Promise<void> => {
                if (notify.method == 'init') {
                    ful(null);
                    this.rpc.removeNotifyHandler(cb);
                }
            }
            this.rpc.addNotifyHandler(cb);
        });
        console.log('Pong received.');
        this.devices = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            method: 'getRegisteredDevices',
            params: [],
        });
    }

    public getDevices(): {id: string, type: string}[] {
        if (this.devices == null) {
            throw new Error('You have to initialize first!');
        }

        return this.devices;
    }

    public getSwitchConfigurator(targetId: string): RPCSwitchConfigurator {
        const switchConfigurator = new RPCSwitchConfigurator(this.rpc, targetId);
        return switchConfigurator;
    }
}
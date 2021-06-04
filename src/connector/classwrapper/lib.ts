import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { RPCProvider } from '../jsonrpcv2';
import { RPCSwitchConfigurator } from "./SwitchConfigurator";

export class RPCControllerFactory extends GenericControllerFactory {
    private ws: WebSocket;
    private rpc: RPCProvider;
    private devices: {id: string, type: string}[] | null = null;

    constructor(ws: WebSocket) {
        super('');
        this.ws = ws;
        const stream = WebSocket.createWebSocketStream(this.ws, {encoding: 'utf-8'});
        this.rpc = new RPCProvider(stream);
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
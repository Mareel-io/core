import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { RPCProvider } from '../jsonrpcv2';
import { RPCSwitchConfigurator } from "./SwitchConfigurator";

export class RPCControllerFactory extends GenericControllerFactory {
    private ws: WebSocket;
    private rpc: RPCProvider;

    constructor(ws: WebSocket) {
        super('');
        this.ws = ws;
        const stream = WebSocket.createWebSocketStream(this.ws, {encoding: 'utf-8'});
        this.rpc = new RPCProvider(stream);
    }

    public async authenticate(): Promise<void> {
        console.warn("You do not have to authenticate here");
    }

    getSwitchConfigurator(): RPCSwitchConfigurator {
        // TODO: FIXME: Implement target getter system rpc method
        const targetId = 'f265a9b2-13cd-43a7-85d2-2f6ac24d0963';
        const switchConfigurator = new RPCSwitchConfigurator(this.rpc, targetId);
        return switchConfigurator;
    }
}
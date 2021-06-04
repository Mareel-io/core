import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { RPCSwitchConfigurator } from "./SwitchConfigurator";

export class RPCControllerFactory extends GenericControllerFactory {
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        super('');
        this.ws = ws;
    }

    public async authenticate(): Promise<void> {
        console.warn("You do not have to authenticate here");
    }

    getSwitchConfigurator() {
        // TODO: Implement me.
    }
}
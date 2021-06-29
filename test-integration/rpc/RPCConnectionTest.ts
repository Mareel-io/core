import WebSocket from "ws";
import { RPCControllerFactory } from "../../dist";

let rpcControllerFactory: RPCControllerFactory | null = null;

describe('RPC daemon test', () => {
    before(async () => {
        const connection = new WebSocket('http://localhost:4000');
        rpcControllerFactory = new RPCControllerFactory(connection);
        await rpcControllerFactory.authenticate();
    });

    it('getDevices', async () => {
        await rpcControllerFactory.getDevices();
    });
})
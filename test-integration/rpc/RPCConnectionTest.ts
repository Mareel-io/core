import WebSocket from "ws";
import { RPCControllerFactory } from "../../dist";

let rpcControllerFactory: RPCControllerFactory | null = null;

describe('RPC daemon test', () => {
    before(async () => {
        const connection = new WebSocket('http://localhost:4000');
        await (new Promise((ful) => {
            connection.on('open', () => {
                ful();
            });
        }) as Promise<void>);
        rpcControllerFactory = new RPCControllerFactory(connection);
        await rpcControllerFactory.init();
        await rpcControllerFactory.authenticate();
        console.log('Done.')
    });

    it('getDevices', async () => {
        console.log('getDevices');
        await rpcControllerFactory.getDevices();
    });
});
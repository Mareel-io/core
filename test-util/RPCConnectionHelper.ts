import WebSocket from "ws";
import { RPCControllerFactory } from "../dist";

export interface RPCConnectionHelperCtx {
    connection: WebSocket | null,
    rpcControllerFactory: RPCControllerFactory | null,
}

export function doRPCTest(testname: string, tests: (ctx: RPCConnectionHelperCtx) => void) {
    const ctx: {
        connection: WebSocket | null,
        rpcControllerFactory: RPCControllerFactory | null,
    } = { connection: null, rpcControllerFactory: null };
    describe(testname, () => {
        before(async () => {
            ctx.connection = new WebSocket('http://localhost:4000');
            await (new Promise((ful) => {
                ctx.connection.on('open', () => {
                    ful();
                });
            }) as Promise<void>);
            ctx.rpcControllerFactory = new RPCControllerFactory(ctx.connection);
            await ctx.rpcControllerFactory.init();
            await ctx.rpcControllerFactory.authenticate();
        });

        tests(ctx);

        after(async () => {
            ctx.connection?.close();
        });
    });
}

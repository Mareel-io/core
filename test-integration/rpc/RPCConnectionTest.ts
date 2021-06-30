import * as chai from "chai";
import { doRPCTest, RPCConnectionHelperCtx } from '../../test-util/RPCConnectionHelper';

doRPCTest('RPC daemon test', (ctx: RPCConnectionHelperCtx) => {
    it('getDevices', async () => {
        console.log('getDevices');
        ctx.rpcControllerFactory.getDevices();
    });

    it('ping', async() => {
        await ctx.rpcControllerFactory.ping().should.eventually.fulfilled;
    });

    it('error', async() => {
        await ctx.rpcControllerFactory.errorPing().should.eventually.rejected;
    });
});

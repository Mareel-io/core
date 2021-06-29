import { doRPCTest, RPCConnectionHelperCtx } from '../../test-util/RPCConnectionHelper';

doRPCTest('RPC daemon test', (ctx: RPCConnectionHelperCtx) => {
    it('getDevices', async () => {
        console.log('getDevices');
        ctx.rpcControllerFactory.getDevices();
    });
});

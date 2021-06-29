import { RPCLogman } from '../../../dist/connector/classwrapper/Logman';
import { doRPCTest, RPCConnectionHelperCtx } from '../../../test-util/RPCConnectionHelper';

doRPCTest('EFM WLAN test', (ctx: RPCConnectionHelperCtx) => {
    let logman: RPCLogman | null = null;
    before(() => {
        const devices = ctx.rpcControllerFactory.getDevices();
        const efmDevices = devices.filter((elem) => {
            return elem.type === 'efm'
        });
        logman = ctx.rpcControllerFactory.getLogman(efmDevices[0].id);
    });

    it('getLog', async () => {
        const log = await logman.queryLog('syslog', new Date('1970-01-01T00:00:00Z'), new Date());
        console.log(log);
    });
});

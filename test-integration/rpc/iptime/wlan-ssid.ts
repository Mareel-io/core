import { RPCWLANConfigurator } from '../../../dist/connector/classwrapper/WLANConfigurator';
import { doRPCTest, RPCConnectionHelperCtx } from '../../../test-util/RPCConnectionHelper';

doRPCTest('EFM WLAN test', (ctx: RPCConnectionHelperCtx) => {
    let wlanConfigurator: RPCWLANConfigurator | null = null;
    before(() => {
        const devices = ctx.rpcControllerFactory.getDevices();
        const efmDevices = devices.filter((elem) => {
            return elem.type === 'efm'
        });
        wlanConfigurator = ctx.rpcControllerFactory.getWLANConfigurator(efmDevices[0].id);
    });

    it('getDeviceList', async () => {
        const devices = await wlanConfigurator.getDeviceList();
        console.log(devices);
    });
});

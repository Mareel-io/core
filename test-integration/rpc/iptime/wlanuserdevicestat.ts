import { RPCWLANConfigurator, RPCWLANUserDeviceStat } from '../../../dist';
import { doRPCTest, RPCConnectionHelperCtx } from '../../../test-util/RPCConnectionHelper';

doRPCTest('EFM WLANUserDeviceStat test', (ctx: RPCConnectionHelperCtx) => {
    let wlanConfigurator: RPCWLANConfigurator | null = null;
    let wlanUserDeviceStat: RPCWLANUserDeviceStat | null = null;
    before(() => {
        const devices = ctx.rpcControllerFactory.getDevices();
        const efmDevices = devices.filter((elem) => {
            return elem.type === 'efm'
        });

        wlanConfigurator = ctx.rpcControllerFactory.getWLANConfigurator(efmDevices[0].id);
        wlanUserDeviceStat = ctx.rpcControllerFactory.getWLANUserDeviceStat(efmDevices[0].id);
    });

    it('getUserDevices', async () => {
        const deviceList = await wlanConfigurator.getDeviceList();
        const res = await wlanUserDeviceStat.getUserDevices(deviceList[0], '0');
        console.log(res);
    });
});

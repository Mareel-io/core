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

    it('getIFace & DeviceCfg', async () => {
        const deviceList = await wlanConfigurator.getDeviceList();
        const ifaceCfg = await wlanConfigurator.getIFaceCfg(deviceList[1], '0');
        const deviceCfg = await wlanConfigurator.getDeviceCfg(deviceList[1]);
    });

    it('setIFaceCfg', async () => {
        const deviceList = await wlanConfigurator.getDeviceList();
        const i = 0;
        const ssid = `Mareel-TB AP01 donotuse-${i}`;
        const devName = deviceList[Math.floor(i / 4)];
        const ifaceCfg = await wlanConfigurator.getIFaceCfg(devName, `${i % 4}`);
        console.log(i)
        console.log(ifaceCfg);
        ifaceCfg.encryption = 'psk2+ccmp';
        ifaceCfg.key = 'Pa55w0rd!@'
        ifaceCfg.ssid = ssid;
        ifaceCfg.disabled = false;
        ifaceCfg.hidden = false;
        await wlanConfigurator.setIFaceCfg(devName, `${i % 4}`, ifaceCfg);
    });
});

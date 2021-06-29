import { RPCSwitchConfigurator } from '../../../dist/connector/classwrapper/SwitchConfigurator';
import { doRPCTest, RPCConnectionHelperCtx } from '../../../test-util/RPCConnectionHelper';

doRPCTest('Cisco VLAN test', (ctx: RPCConnectionHelperCtx) => {
    let switchConfigurator: RPCSwitchConfigurator | null = null;
    before(() => {
        const devices = ctx.rpcControllerFactory.getDevices();
        const ciscoDevices = devices.filter((elem) => {
            return elem.type === 'cisco'
        });
        switchConfigurator = ctx.rpcControllerFactory.getSwitchConfigurator(ciscoDevices[0].id);
    });

    it('loadConfig', async () => {
        await switchConfigurator.loadConfig();
    });

    it('getAllVLAN', async() => {
        const vlans = await switchConfigurator.getAllVLAN();
    });
});

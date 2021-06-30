import { RPCSwitchConfigurator } from '../../../dist';
import { doRPCTest, RPCConnectionHelperCtx } from '../../../test-util/RPCConnectionHelper';

doRPCTest('EFM Switch test', (ctx: RPCConnectionHelperCtx) => {
    let switchConfigurator: RPCSwitchConfigurator | null = null;
    before(() => {
        const devices = ctx.rpcControllerFactory.getDevices();
        const efmDevices = devices.filter((elem) => {
            return elem.type === 'efm'
        });

        switchConfigurator = ctx.rpcControllerFactory.getSwitchConfigurator(efmDevices[0].id);
    });

    it('getSwitchPorts', async () => {
        const ret = await switchConfigurator.getSwitchPorts();
        console.log(ret);
    });
});

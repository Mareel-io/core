import { RPCFirewallConfigurator } from '../../../dist';
import { doRPCTest, RPCConnectionHelperCtx } from '../../../test-util/RPCConnectionHelper';

doRPCTest('EFM Firewall test', (ctx: RPCConnectionHelperCtx) => {
    let firewallConfigurator: RPCFirewallConfigurator | null = null;
    before(() => {
        const devices = ctx.rpcControllerFactory.getDevices();
        const efmDevices = devices.filter((elem) => {
            return elem.type === 'efm'
        });

        firewallConfigurator = ctx.rpcControllerFactory.getFirewallConfigurator(efmDevices[0].id);
    });

    it('getFirewallConfiguration', async () => {
        const ret = await firewallConfigurator.getFirewallConfiguration();
        console.log(ret);
    });

    it('setFirewallConfiguration', async() => {
        const ret = await firewallConfigurator.getFirewallConfiguration();
        await firewallConfigurator.setFirewallConfiguration(ret);
    })
});

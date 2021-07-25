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
    });

    it('setFirewallConfiguration - custom', async () => {
        const ret = await firewallConfigurator.getFirewallConfiguration();
        await firewallConfigurator.setFirewallConfiguration([
            {
                name: 'testsubject',
                src: 'LAN',
                src_ip: '192.168.1.3',
                proto: 'all',
                dest: 'WAN',
                dest_ip: '255.255.255.255',
                family: 'ipv4',
                target: 'DROP',
                enabled: true,
            }
        ])
    });

    it('setFirewallConfiguration - remove', async () => {
        const ret = await firewallConfigurator.getFirewallConfiguration();
        await firewallConfigurator.setFirewallConfiguration([]);
    });
});

const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const firewallConfigurator = efmController.getFirewallConfigurator();
    const res = await firewallConfigurator.getFirewallConfiguration();
    console.log(res);
    await firewallConfigurator.setFirewallConfiguration(res);
}

main();

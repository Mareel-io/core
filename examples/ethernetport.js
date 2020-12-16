const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const switchConfigurator = efmController.getSwitchConfigurator();
    const res = await switchConfigurator.getSwitchPorts();
    console.log(res);
}

main();

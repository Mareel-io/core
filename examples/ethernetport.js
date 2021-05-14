const maril = require('../');

// efm cisco
const mode = 'cisco';

async function main() {
    let controller;
    if (mode === 'efm') {
        controller = new maril.EFMControllerFactory('http://192.168.0.1/');
        await controller.authenticate({id: 'admin', pass: 'admin'});
    } else if (mode === 'cisco') {
        controller = new maril.CiscoControllerFactory('192.168.1.2', './mibjson/cisco.json');
        await controller.authenticate({
            id: 'admin',
            authProtocol: 'sha',
            authKey: '4f5ACmTA9aT3rQ7!',
            privacyProtocol: 'des',
            privacyKey: '4f5ACmTA9aT3rQ7!',
        });
    }
    const switchConfigurator = controller.getSwitchConfigurator();
    const res = await switchConfigurator.getSwitchPorts();
    console.log(res);
}

main();

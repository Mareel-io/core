const maril = require('../');

// efm cisco
const mode = 'cisco';

async function main() {
    let controller;
    if (mode === 'efm') {
        controller = new maril.EFMControllerFactory('http://192.168.0.1/');
        await controller.authenticate({id: 'admin', pass: 'admin'});
    } else if (mode === 'cisco') {
        const tftp = new maril.CiscoTFTPServer();
        tftp.listen();
        controller = new maril.CiscoControllerFactory('192.168.1.3', './mibjson/cisco.json', tftp, '10.64.48.11');
        await controller.authenticate({
            snmpCredential: {
                id: 'admin',
                authProtocol: 'sha512',
                authKey: '4f5ACmTA9aT3rQ7!',
                privacyProtocol: 'aes',
                privacyKey: '4f5ACmTA9aT3rQ7!',
            },
            sshCredential: {
                user: 'admin',
                password: '4f5ACmTA9aT3rQ7!',
            },
        });
    }
    await controller.init();
    const switchConfigurator = controller.getSwitchConfigurator();
    switchConfigurator.init();
    await switchConfigurator.loadConfig();
    console.log('Config loaded.');
    const vlans = await switchConfigurator.getAllVLAN();
    console.log(vlans);
    await switchConfigurator.setVLAN(vlans[0]);
    console.log(await switchConfigurator.extractCfg());
    await switchConfigurator.applyConfig();
    console.log('Done!');
}

main();

const maril = require('../');

// efm cisco
const mode = 'cisco';

async function main() {
    let controller;
    if (mode === 'efm') {
        controller = new maril.EFMControllerFactory('http://192.168.0.1/');
        await controller.authenticate({id: 'admin', pass: 'admin'});
    } else if (mode === 'cisco') {
        const tftp = new maril.CiscoTFTPServer('10.64.0.243');
        // Warning: this require node.js bind to UDP 69 - TFTP
        // May require root priviledge.
        tftp.listen();
        controller = new maril.CiscoControllerFactory(
            '192.168.1.3',
            './mibjson/cisco.json',
            tftp,
        );
        await controller.init();
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
    const switchConfigurator = controller.getSwitchConfigurator();
    // Note: this may change in the future, service spawning will be
    // removed from SwitchConfigurator.
    switchConfigurator.init();

    // Load config using built-in TFTP server
    await switchConfigurator.loadConfig();
    console.log('Config loaded.');

    // Get VLAN using stored configuration (in memory)
    const vlans = await switchConfigurator.getAllVLAN();
    console.log(vlans);

    // Update current (maybe new) VLAN settings to configuration file
    await switchConfigurator.setVLAN(vlans[0]);

    // Show the configuration file
    console.log(await switchConfigurator.extractCfg());

    // Apply the configuration using TFTP, note that this will only
    // affect running-config slot.
    await switchConfigurator.applyConfig();
    console.log('Done!');
}

main();

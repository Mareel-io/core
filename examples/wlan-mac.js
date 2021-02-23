const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const wlanConfigurator = efmController.getWLANConfigurator();
    const deviceList = await wlanConfigurator.getDeviceList();
    await wlanConfigurator.setIFaceMACAuthMode(deviceList[1], 0, 'white');
    await wlanConfigurator.setIFaceMACAuthDevice(deviceList[1], 0, {
        macaddr: '00:01:02:03:04:05',
        name: 'testmac',
    });

    // Wait for configuration request
    await new Promise((ful, _rej) => {
        setTimeout(() => { ful() }, 100);
    });

    let res = await wlanConfigurator.getIFaceMACAuthList(deviceList[1], 0);
    console.log(res);
    await wlanConfigurator.removeIFaceMACAuthDevice(deviceList[1], 0, '00:01:02:03:04:05');
    res = await wlanConfigurator.getIFaceMACAuthList(deviceList[1], 0);
    console.log(res);
    await wlanConfigurator.setIFaceMACAuthMode(deviceList[1], 0, 'deactivate');
}

main();
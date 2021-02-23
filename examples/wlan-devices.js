const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const wlanUserDeviceStat = efmController.getWLANUserDeviceStat();
    const deviceList = await wlanConfigurator.getDeviceList();
    const res = await wlanUserDeviceStat.getUserDevices(deviceList[0], 0);
    console.log(res);
}

main();

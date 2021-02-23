const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const wlanconfigurator = efmController.getWLANConfigurator();
    const deviceList = await wlanconfigurator.getDeviceList();
    const ifaceCfg = await wlanconfigurator.getIFaceCfg(deviceList[1], 0);
    const deviceCfg = await wlanconfigurator.getDeviceCfg(deviceList[1]);

    console.log(deviceCfg);
    console.log(ifaceCfg);
    for (let i = 0; i < deviceList.length * 4; i++) {
        const ssid = `Maril-TB AP01 donotuse-${i}`;
        const devName = deviceList[Math.floor(i / 4)];
        const ifaceCfg = await wlanconfigurator.getIFaceCfg(devName, `${i % 4}`);
        console.log(i)
        console.log(ifaceCfg);
        ifaceCfg.encryption = 'psk2+ccmp';
        ifaceCfg.key = 'Pa55w0rd!@'
        ifaceCfg.ssid = ssid;
        ifaceCfg.disabled = false;
        ifaceCfg.hidden = false;
        await wlanconfigurator.setIFaceCfg(devName, `${i % 4}`, ifaceCfg);
    }
}

main();

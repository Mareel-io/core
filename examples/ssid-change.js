const maril = require('../');

const ssids = [
    'Maril-TB AP01 donotuse-001',
    'Maril-TB AP01 donotuse-002',
    'Maril-TB AP01 donotuse-003',
    'Maril-TB AP01 donotuse-004',
    'Maril-TB AP01 donotuse-005',
    'Maril-TB AP01 donotuse-006',
    'Maril-TB AP01 donotuse-007',
    'Maril-TB AP01 donotuse-008',
];

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const wlanconfigurator = efmController.getWLANConfigurator();
    const deviceCfg = await wlanconfigurator.getDeviceCfg('wlan5g');
    const ifaceCfg = await wlanconfigurator.getIFaceCfg('wlan5g', 0);

    console.log(deviceCfg);
    console.log(ifaceCfg);
    for (let i = 0; i < ssids.length; i++) {
        const devName = i > 3 ? 'wlan5g' : 'wlan2g';
        const ifaceCfg = await wlanconfigurator.getIFaceCfg(devName, `${i % 4}`);
        console.log(i)
        console.log(ifaceCfg);
        ifaceCfg.encryption = 'psk2+ccmp';
        ifaceCfg.key = 'Pa55w0rd!@'
        ifaceCfg.ssid = ssids[i];
        ifaceCfg.disabled = false;
        ifaceCfg.hidden = false;
        await wlanconfigurator.setIFaceCfg(devName, `${i % 4}`, ifaceCfg);
    }
}

main();

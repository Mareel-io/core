const maril = require('../');

const ssids = [
    '01 Three Rings for the Elven-kings under the sky',
    '02 Seven for the Dwarf-lords in their halls of stone',
    '03 Nine for Mortal Men doomed to die',
    '04 One for the Dark Lord on his dark throne',
    '05 In the Land of Mordor where the Shadows lie',
    '06 One Ring to rule them all, One Ring to find them',
    '07 One Ring to bring them all, and in the darkness bind them',
    '08 In the Land of Mordor where the Shadows lie',
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
        ifaceCfg.ssid = ssids[i];
        ifaceCfg.disabled = false;
        ifaceCfg.hidden = false;
        await wlanconfigurator.setIFaceCfg(devName, `${i % 4}`, ifaceCfg);
    }
}

main();

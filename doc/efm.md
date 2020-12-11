# WLANConfigurator
## getDeviceCfg
Returns DeviceCfg of current device.

There are two devices are exist in A8004T: wlan5g and wlan2g

Code example
```
const maril = require('../');

...

const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
await efmController.authenticate({id: 'admin', pass: 'admin'});
const wlanconfigurator = efmController.getWLANConfigurator();
const deviceCfg = await wlanconfigurator.getDeviceCfg('wlan5g');

console.log(deviceCfg);
```

#### Current limitation
* Capability API is missing
* Not able to extract MIMO information
* TXPower unit is not mW, but percent
* Unable to extract proper CRDA country region

## setDeviceCfg
Update device config
Code example
```
const maril = require('../');

...

const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
await efmController.authenticate({id: 'admin', pass: 'admin'});
const wlanconfigurator = efmController.getWLANConfigurator();
const deviceCfg = await wlanconfigurator.getDeviceCfg('wlan5g');

deviceCfg.channel = 100; // Wi-Fi channel 100. Note that auto is not supported
deviceCfg.chanbw = 80; // 80MHz.
deviceCfg.txpower = 100; // 100%, Note: it should be mW, not percent
deviceCfg.country = 'KR'; // [WIP] Not working properly yet.
deviceCfg.beacon_int = 100; // 100msec beacon interval

await wlanconfigurator.setDeviceCfg('wlan5g', deviceCfg);
```

## getIFaceCfg
Returns IFaceCfg of current iface

First parameter is, device name. and second parameter is iface name (0 ~ 3)

Code example
```
const maril = require('../');

...

const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
await efmController.authenticate({id: 'admin', pass: 'admin'});
const wlanconfigurator = efmController.getWLANConfigurator();
const ifaceCfg = await wlanconfigurator.getIFaceCfg('wlan5g', '0');

console.log(ifaceCfg);
```

## setIFaceCfg
Update IFaceCfg of current iface

First parameter is, device name. and second parameter is iface name (0 ~ 3)

Code example
```
const maril = require('../');

...

const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
await efmController.authenticate({id: 'admin', pass: 'admin'});
const wlanconfigurator = efmController.getWLANConfigurator();
const ifaceCfg = await wlanconfigurator.getIFaceCfg('wlan5g', '0');

ifaceCfg.disabled = false; // True to shut down IFace
ifaceCfg.ssid = 'MarilForever'; // ;)
ifaceCfg.hidden = false; // True to disable SSID broadcasting
ifaceCfg.wmm = true; // WMM feature
ifaceCfg.encryption = 'wpa2psk_aes'; // or 'nouse'. Note: it will be changed to OpenWRT format
ifaceCfg.key = '1q2w3e4r!@'; // Password. you must change this

await wlanconfigurator.setIFaceCfg('wlan5g', 0, ifaceCfg); 
```
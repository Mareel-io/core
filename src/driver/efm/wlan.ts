import { AxiosInstance } from 'axios';
import { WLANConfigurator as GenericWLANConfigurator } from '../generic/wlan';
import { WLANDevConfiguration } from '../efm/WLANDevConfiguration';
import { WLANIFaceCfg } from '../efm/WLANIFaceCfg';
import qs from 'qs';
import { JSDOM } from 'jsdom';

// Internal types for ipTIME
interface DeviceCfg {
    wlmode: string,
    wlmodetxt: string,
    ctlchannel: string,
    cntchannel: string,
    chandisable: string,
    dfswarning: string,
    run: string,
    mbsspolicy: string,
    txpower: string,
    beacon: string,
    rts: string,
    wpsmode: string,
    wmm: string,
    dynchannel: string,
    dcsperiodhour: string,
    wirelessmode: string,
    country: string,
    channelwidth: string,
    txbfmode: string,
    vht24g: string,
    mimoant: string,
    realchannelwidth: string,
}

interface IFaceCfg {
    run: string,
    wmm: string,
    ssid: string,
    txrate: string,
    rxrate: string,
    qosenable: string,
    useenterprise: string,
    radiusserver: string,
    radiussecret: string,
    radiusport: string,
    enterpriselist: string,
    personallist: string,
    wpapsk: string,
    wepkey: string,
    broadcast: string,
}

export class WLANConfigurator extends GenericWLANConfigurator {
    protected api: AxiosInstance;
    constructor(axios: AxiosInstance) {
        super();
        this.api = axios;
    }

    async getDeviceCfg(devname: 'wlan5g' | 'wlan2g') {
        const params = {
            tmenu: 'iframe',
            smenu: 'hiddenwlsetup',
            wlmode: (devname === 'wlan5g') ? 1 : 0, // Crude but it will work
            action: 'changebssid',
            sidx: 0, // Root device, not ssid
        }

        const res = await this.api.post('/sess-bin/timepro.cgi', qs.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const dom = new JSDOM(res.data);
        const fields = dom.window.document.body.getElementsByTagName('input');
        const devcfg = {} as DeviceCfg;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            (devcfg as any)[field.name] = field.value; // Override... for now.
        }

        const wlanDevCfg = new WLANDevConfiguration();
        wlanDevCfg.disabled = devcfg.run === '1';
        wlanDevCfg.channel = parseInt(devcfg.cntchannel, 10);
        wlanDevCfg.hwmode = devcfg.wlmode === '1' ? 'a' : 'g';
        wlanDevCfg.htmode = 'HT20'; // Does not affect here
        wlanDevCfg.chanbw = devcfg.channelwidth as any;
        wlanDevCfg.txpower = parseInt(devcfg.txpower, 10);
        wlanDevCfg.diversity = parseInt(devcfg.mimoant, 10) > 1;
        wlanDevCfg.country = 'KR' // Hardcode it for now.. TODO: FIXME! Write adapter for it!
        wlanDevCfg.country_ie = true; // There is no option for it.
        wlanDevCfg.beacon_int = parseInt(devcfg.beacon, 10);
        wlanDevCfg.require_mode = 'none'; // Unsupported.

        return wlanDevCfg;
    }

    async setDeviceCfg(devname: string, cfg: WLANDevConfiguration) {
        // TODO: Implement meee...
    }

    async getIFaceCfg(devname: 'wlan5g' | 'wlan2g', ifname: string) {
        const params = {
            tmenu: 'iframe',
            smenu: 'hiddenwlsetup',
            wlmode: (devname === 'wlan5g') ? 1 : 0, // Crude but it will work
            action: 'changebssid',
            sidx: parseInt(ifname, 10),
        }

        const res = await this.api.post('/sess-bin/timepro.cgi', qs.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const dom = new JSDOM(res.data);
        const fields = dom.window.document.body.getElementsByTagName('input');
        const ifacecfg = {} as IFaceCfg;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            (ifacecfg as any)[field.name] = field.value;
        }

        const wlanIfaceCfg = new WLANIFaceCfg();
        
        wlanIfaceCfg.mode = 'ap'; // TODO: Support STA mode when possible.
        wlanIfaceCfg.disabled = ifacecfg.run === '0';
        wlanIfaceCfg.ssid = ifacecfg.ssid;
        wlanIfaceCfg.bssid = 'default'; // ipTIME does not support bssid spoofing
        wlanIfaceCfg.mesh_id = 'none'; // TODO: Research EasyMesh
        wlanIfaceCfg.hidden = ifacecfg.broadcast === '0';
        wlanIfaceCfg.isolate = false; // TODO: Implement this
        wlanIfaceCfg.doth = true; // There is no feature to disable it
        wlanIfaceCfg.wmm = ifacecfg.wmm === '1';
        wlanIfaceCfg.encryption = ifacecfg.personallist; // TODO: Translation layer between OpenWRT notation and ipTIME notation
        wlanIfaceCfg.key = ifacecfg.wpapsk; // TODO: Support for other mechanisms

        return wlanIfaceCfg;
    }

    async setIFaceCfg(devname: string, ifname: string, cfg: WLANIFaceCfg) {
        // TODO: Implement meee...
    }
}
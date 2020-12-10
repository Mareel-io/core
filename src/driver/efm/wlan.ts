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

const templateCfg = {
    tmenu: 'iframe',
    smenu: 'hiddenwlsetup',
    wlmode: 1,
    wlmodetxt: '5g',
    action: 'allsubmit',
    sidx: 0,
    uiidx: 0,
    ssid: 'iptime5G',
    autochannel: 0,
    ctlchannel: 149,
    cntchannel: 149,
    ch_no_change: 1,
    chandisable: 0,
    dfswarning: 'l',
    run: 1,
    mbsspolicy: 0,
    txrate: 0,
    rxrate: 0,
    qosenable: 0,
    useenterprise: 0,
    radiusserver: '',
    radiussecret: '',
    radiusport: 1812,
    enterpriselist: 'wpa2_aes',
    personallist: 'nouse',
    wpapsk: '',
    wepkey: '',
    broadcast: 1,
    lpchannel: '',
    txpower: 100,
    beacon: 100,
    rts: 2347,
    wpsmode: 1,
    fragmentation: 2346,
    wmm: 1,
    dynchannel: 0,
    dcsperiodhour: 2,
    wirelessmode: 10,
    country: 'KR',
    channelwidth: 80,
    txbfmumode: 7,
    vht24g: 0,
    mimoant: 4,
    realchanwidth: 80,
}

export class WLANConfigurator extends GenericWLANConfigurator {
    protected api: AxiosInstance;
    constructor(axios: AxiosInstance) {
        super();
        this.api = axios;
    }

    async getRawConfig(devname: 'wlan5g' | 'wlan2g', ifname: string): Promise<any> {
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
        const map = {} as any;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            map[field.name] = field.value;
        }

        return map;
    }
    
    async getDeviceCfg(devname: 'wlan5g' | 'wlan2g') {
        const devcfg = await this.getRawConfig(devname, '0') as DeviceCfg;
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
    
    async setDeviceCfg(devname: 'wlan5g' | 'wlan2g', cfg: WLANDevConfiguration) {
        const currentCfg = await this.getRawConfig(devname, '0');
        const baseCfg = Object.assign(Object.assign({}, templateCfg), currentCfg);
        baseCfg.wlmode = devname === 'wlan5g' ? 1 : 0;
        baseCfg.wlmodetxt = devname === 'wlan5g' ? '5g' : '2g';
        baseCfg.action = 'allsubmit'; // TODO: Support WLAN shutdown
        baseCfg.sidx = 0; // We are configuring master wlan
        baseCfg.run = cfg.disabled ? 0 : 1,
        baseCfg.cntchannel = cfg.channel;
        baseCfg.ctlchannel = cfg.channel;
        baseCfg.ch_no_change = cfg.channel != parseInt(currentCfg.ctlchannel, 10) ? 1 : 0;
        baseCfg.channelwidth = parseInt(cfg.chanbw, 10);
        baseCfg.txpower = cfg.txpower === 'auto' ? 100 : cfg.txpower;
        //baseCfg.mimoant // TODO: Implement meeeee...
        baseCfg.country = 'KR' // TODO: FIXME! Write adapter for it!
        //baseCfg.txbfmumode // TODO: Implement meeee....
        baseCfg.beacon = cfg.beacon_int;
        // TODO: Implement meee...

        const form = qs.stringify(baseCfg);
        const res = await this.api.post('/sess-bin/timepro.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }
    
    async getIFaceCfg(devname: 'wlan5g' | 'wlan2g', ifname: string) {
        const ifacecfg = await this.getRawConfig(devname, ifname) as IFaceCfg;
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
    
    async setIFaceCfg(devname: 'wlan5g' | 'wlan2g', ifname: string, cfg: WLANIFaceCfg) {
        const currentCfg = await this.getRawConfig(devname, ifname);
        const baseCfg = Object.assign(Object.assign({}, templateCfg), currentCfg);

        baseCfg.action = 'allsubmit'; // TODO: Support WLAN shutdown
        baseCfg.run = cfg.disabled ? 0 : 1;
        baseCfg.ssid = cfg.ssid;
        baseCfg.broadcast = cfg.hidden ? 0 : 1;
        baseCfg.wmm = cfg.wmm ? 1 : 0;
        baseCfg.personallist = cfg.encryption; // TODO: Translation layer between OWRT and ipTIME
        baseCfg.wpapsk = cfg.key; // TODO: Support for other mechanisms

        const form = qs.stringify(baseCfg);
        const res = await this.api.post('/sess-bin/timepro.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }
}
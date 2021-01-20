import { AxiosInstance } from 'axios';
import { WLANConfigurator as GenericWLANConfigurator } from '../generic/wlan';
import { WLANDevConfiguration } from '../efm/WLANDevConfiguration';
import { WLANIFaceCfg } from '../efm/WLANIFaceCfg';
import qs from 'qs';
import { JSDOM } from 'jsdom';
import { ResponseChecker } from './ResponseChecker';

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

interface EFMCapKV {
    value: string, text: string,
}

interface wlancap {
    exttitle: string,
    options5g: [EFMCapKV] | undefined,
    options2g: [EFMCapKV] | undefined,
    chanwidth5g: [EFMCapKV] | undefined,
    chanwidth2g: [EFMCapKV] | undefined,
    mumimo5g: [EFMCapKV] | undefined,
    mumimo2g: [EFMCapKV] | undefined,
    mimoant5g: [EFMCapKV] | undefined,
    mimoant2g: [EFMCapKV] | undefined,
}

export class WLANConfigurator extends GenericWLANConfigurator {
    protected api: AxiosInstance;
    constructor(axios: AxiosInstance) {
        super();
        this.api = axios;
    }

    /**
     * get raw config from EFM router
     * 
     * @param devname - device name. wlan5g and wlan2g is possible value.
     * @param ifname - interface number as string. 0 to 3.
     */
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async getRawConfig(devname: 'wlan5g' | 'wlan2g', ifname: string): Promise<any> {
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
        ResponseChecker.check(res.data);
        
        const dom = new JSDOM(res.data);
        const fields = dom.window.document.body.getElementsByTagName('input');
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = {} as any;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            map[field.name] = field.value;
        }

        return map;
    }

    /**
     * Get raw EFM-specific device capability
     * Work in progress, return type prone to change
     */
    async getDeviceCapability(): Promise<wlancap> {
        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: {
                tmenu: 'iframe',
                smenu: 'extendsetup',
            },
        });
        ResponseChecker.check(res.data);

        const dom = new JSDOM(res.data);
        const scriptElems = dom.window.document.getElementsByTagName('script');
        for (let i = 0; i < scriptElems.length; i++) {
            const elem = scriptElems.item(i);
            const script = (elem as Element).innerHTML;
            const flag = script.match(/^parent\.document/);
            if (flag == null) continue;

            const configs = script.replace(/ /g, '').split(';').filter((elem) => {
                return elem.startsWith('parent.document')
            }).map((elem) => {
                const arr = elem.split('=');
                // Note: it can break easily...
                return {
                    key: arr[0].replace('parent.document.', ''),
                    value: JSON.parse(arr[1].replace(/'/g, "\"")) as EFMCapKV | string,
                };
            }).reduce((acc, curVal) => {
                const arrChk = curVal.key.match(/^([^[]*)\[([^]*)]\]*$/);
                if (arrChk != null) {
                    if (!(acc[arrChk[1]] instanceof Array)) {
                        acc[arrChk[1]] = [] as EFMCapKV[];
                    }

                    if (typeof curVal.value === 'string') {
                        throw new Error('Huh?');
                    }

                    (acc[arrChk[1]] as EFMCapKV[])[parseInt(arrChk[2], 10)] = curVal.value;
                } else {
                    if (curVal.key.match(/\.length$/) != null) return acc;
                    if (curVal.value === '[]' || curVal.value instanceof Array) return acc;
                    if (typeof curVal.value !== 'string') {
                        throw new Error('Huh?');
                    }
                    acc[curVal.key] = curVal.value;
                }
                return acc;
            }, {} as { [key: string]: EFMCapKV[] | string});

            // TODO: Re-format in fine config. Current return value just sucks
            return configs as unknown as wlancap;
        }

        throw new Error('Failed to fetch WLAN capability.');
    }
   
    /**
     * Get device name.
     * 
     * Currently supported features:
     * 
     * * WLANDevConfiguration.disabled
     * * WLANDevConfiguration.channel
     * * WLANDevConfiguration.hwmode - READ ONLY
     * * WLANDevConfiguration.chanbw
     * * WLANDevConfiguration.txpower - not mW, but percent of max txpwr
     * * WLANDevConfiguration.diversity
     * * WLANDevConfiguration.country - partially, WIP. do not use value other then KR (yet)
     * * WLANDevConfiguration.beacon_int
     * 
     * @param devname - device name. wlan5g and wlan2g is possible value.
     * @returns WLANDevConfiguration array
     */
    async getDeviceCfg(devname: 'wlan5g' | 'wlan2g'): Promise<WLANDevConfiguration> {
        const devcfg = await this.getRawConfig(devname, '0') as DeviceCfg;
        const wlanDevCfg = new WLANDevConfiguration();
        wlanDevCfg.disabled = devcfg.run === '1';
        wlanDevCfg.channel = parseInt(devcfg.cntchannel, 10);
        wlanDevCfg.hwmode = devcfg.wlmode === '1' ? 'a' : 'g';
        wlanDevCfg.htmode = 'HT20'; // Does not affect here
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        wlanDevCfg.chanbw = devcfg.channelwidth as any;
        wlanDevCfg.txpower = parseInt(devcfg.txpower, 10);
        wlanDevCfg.diversity = parseInt(devcfg.mimoant, 10) > 1;
        wlanDevCfg.country = 'KR' // Hardcode it for now.. TODO: FIXME! Write adapter for it!
        wlanDevCfg.country_ie = true; // There is no option for it.
        wlanDevCfg.beacon_int = parseInt(devcfg.beacon, 10);
        wlanDevCfg.require_mode = 'none'; // Unsupported.
        
        return wlanDevCfg;
    }
    
    /**
     * Set device configuration using given cfg.
     * 
     * Supported features:
     * * WLANDevConfiguration.disabled
     * * WLANDevConfiguration.channel - 'auto' is not supported. fallback code WIP
     * * WLANDevConfiguration.chanbw - '80+80' is not supported.
     * * WLANDevConfiguration.txpower - partially. not in mW, but percent of max txpwr
     * * WLANDevConfiguration.country - WIP, does not support value other then KR
     * * WLANDevConfiguration.beacon_int
     * 
     * @param devname - Device name. wlan5g and wlan2g is supported.
     * @param cfg - WLANDevConfiguration object. see notes for supported feature.
     */
    async setDeviceCfg(devname: 'wlan5g' | 'wlan2g', cfg: WLANDevConfiguration): Promise<void> {
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
        ResponseChecker.check(res.data);
    }
    
    /**
     * Get interface configuration
     * 
     * Supported features:
     * * WLANIFaceCfg.disabled
     * * WLANIFaceCfg.ssid
     * * WLANIFaceCfg.hidden
     * * WLANIFaceCfg.wmm
     * * WLANIFaceCfg.encryption
     * * WLANIFaceCfg.key
     * 
     * @param devname - device name. wlan5g and wlan2g is possible value.
     * @param ifname - interface number as string. 0 to 3.
     */
    async getIFaceCfg(devname: 'wlan5g' | 'wlan2g', ifname: string): Promise<WLANIFaceCfg> {
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
        wlanIfaceCfg.encryption_efm = ifacecfg.personallist;
        wlanIfaceCfg.key = ifacecfg.wpapsk; // TODO: Support for other mechanisms
        
        return wlanIfaceCfg;
    }
    
    /**
     * Set WLAN interface configuration.
     * 
     * WLANIFaceCfg.disabled
     * WLANIFaceCfg.ssid
     * WLANIFaceCfg.hidden
     * WLANIFaceCfg.wmm
     * WLANIFaceCfg.encryption
     * WLANIFaceCfg.key
     * 
     * @param devname - device name. wlan5g and wlan2g is possible value.
     * @param ifname - interface number as string. 0 to 3.
     * @param cfg - WLANIfaceCfg. see notes for capability
     */
    async setIFaceCfg(devname: 'wlan5g' | 'wlan2g', ifname: string, cfg: WLANIFaceCfg): Promise<void> {
        const currentCfg = await this.getRawConfig(devname, ifname);
        const baseCfg = Object.assign(Object.assign({}, templateCfg), currentCfg);

        // If we changed disabled flag, need to submit twice
        const changeActivation = cfg.disabled !== (currentCfg.run === '0');
        baseCfg.action = changeActivation ? 'bssidonoff' : 'allsubmit'
        baseCfg.run = cfg.disabled ? 0 : 1;
        baseCfg.ssid = cfg.ssid;
        baseCfg.broadcast = cfg.hidden ? 0 : 1;
        baseCfg.wmm = cfg.wmm ? 1 : 0;
        baseCfg.personallist = cfg.encryption_efm;
        baseCfg.wpapsk = cfg.key; // TODO: Support for other mechanisms

        const form = qs.stringify(baseCfg);
        const res = await this.api.post('/sess-bin/timepro.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        ResponseChecker.check(res.data);

        if (changeActivation) {
            await this.setIFaceCfg(devname, ifname, cfg);
        }
    }
}
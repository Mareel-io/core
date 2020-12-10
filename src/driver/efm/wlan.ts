import { AxiosInstance } from 'axios';
import { WLANConfigurator as GenericWLANConfigurator } from '../generic/wlan';
import { WLANDevConfiguration } from '../efm/WLANDevConfiguration';
import { WLANIFaceCfg } from '../efm/WLANIFaceCfg';
import qs from 'qs';
import { JSDOM } from 'jsdom';

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
        const map = {} as any;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            map[field.name] = field.value;
        }

        console.log(map)

        return new WLANDevConfiguration();
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
            sidx: 1,
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

        console.log(map)
        // TODO: Implement meee...
        return new WLANIFaceCfg();
    }

    async setIFaceCfg(devname: string, ifname: string, cfg: WLANIFaceCfg) {
        // TODO: Implement meee...
    }
}
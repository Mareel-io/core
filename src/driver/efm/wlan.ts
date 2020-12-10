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

    async getDeviceCfg(devname: string) {
        // TODO: Implement meeee...
        const params = {
            tmenu: 'iframe',
            smenu: 'hiddenwlsetup',
            wlmode: 1, // todo: derive this using devname
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

    async getIFaceCfg(devname: string) {
        // TODO: Implement meee...
        return new WLANIFaceCfg();
    }

    async setIFaceCfg(devname: string, ifname: string, cfg: WLANIFaceCfg) {
        // TODO: Implement meee...
    }
}
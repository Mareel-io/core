import { AxiosInstance } from 'axios';
import { WLANConfigurator as GenericWLANConfigurator } from '../generic/wlan';
import { WLANDevConfiguration } from '../efm/WLANDevConfiguration';
import { WLANIFaceCfg } from '../efm/WLANIFaceCfg';

export class WLANConfigurator extends GenericWLANConfigurator {
    protected api: AxiosInstance;
    constructor(axios: AxiosInstance) {
        super();
        this.api = axios;
    }

    async getDeviceCfg(devname: string) {
        // TODO: Implement meeee...
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
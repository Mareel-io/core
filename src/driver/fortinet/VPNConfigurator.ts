import { AxiosInstance } from "axios";
import { MethodNotImplementedError, UnsupportedFeatureError } from "../../error/MarilError";
import { FortigateSSLVPN } from "./util/types";
import { SSLVPN, VPNConfigurator as GenericVPNConfigurator } from "../generic/VPNConfigurator";

// URLs
// https://192.168.1.99/api/v2/cmdb/vpn.ssl/settings
// /api/v2/cmdb/vpn.ssl.web/portal

export class FortiVPNConfigurator extends GenericVPNConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    private async getSSLVPNConfiguration() {
        // TODO: setup auth provider
        //
        const res = await this.api.get('/api/v2/cmdb/vpn.ssl/settings');
        const sslvpnConfigs: FortigateSSLVPN = res.data.results;
        return sslvpnConfigs;
    }

    private async setSSLVPNConfiguration(config: FortigateSSLVPN) {
        const res = await this.api.put('/api/v2/cmdb/vpn.ssl/settings', config);
    }

    private async getIPSecConfiguration() {
        throw new MethodNotImplementedError('Method not implemented.');
    }

    private async setIPSecConfiguration() {
        throw new MethodNotImplementedError('Method not implemented.');
    }

    public async getVPNConfigurations(type: string): Promise<any[]> {
        switch (type) {
            case 'fortissl':
                await this.getSSLVPNConfiguration();
                return [];
                break;
            case 'ipsec':
                throw new MethodNotImplementedError(`ipsec need to be implemented.`)
            default:
                throw new UnsupportedFeatureError(`Unsupported VPN type ${type}`);
        }
    }

    public async setVPNConfiguration(type: string, idx: number, config: SSLVPN): Promise<void> {
        switch (type) {
            case 'fortissl':
                //await this.setSSLVPNConfiguration();
                break;
            default:
                throw new UnsupportedFeatureError(`Unsupported VPN type ${type}`);
        }
    }

    public async deleteVPNConfiguration(type: string, idx: number): Promise<void> {
        switch (type) {
            case 'fortissl':
                throw new UnsupportedFeatureError('Only set is allowed.');
                break;
            case 'ipsec':
                throw new MethodNotImplementedError(`ipsec need to be implemented.`)
            default:
                throw new UnsupportedFeatureError(`Unsupported VPN type ${type}`);
        }
    }

    public async addVPNConfiguration(type: string, config: any): Promise<void> {
        switch (type) {
            case 'fortissl':
                throw new UnsupportedFeatureError('Only set is allowed.');
                break;
            case 'ipsec':
                throw new MethodNotImplementedError(`ipsec need to be implemented.`)
            default:
                throw new UnsupportedFeatureError(`Unsupported VPN type ${type}`);
        }
    }
}
import { AxiosInstance } from "axios";
import { MethodNotImplementedError, UnsupportedFeatureError } from "../../error/MarilError";
import { FortiSSLVPN } from "./util/types";
import { VPNConfigurator as GenericVPNConfigurator } from "../generic/VPNConfigurator";

// URLs
// https://192.168.1.99/api/v2/cmdb/vpn.ssl/settings
// /api/v2/cmdb/vpn.ssl.web/portal

export class VPNConfigurator extends GenericVPNConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    private async getSSLVPNConfiguration() {
        const res = await this.api.get('/api/v2/cmdb/vpn.ssl/settings');
        const sslvpnConfigs: FortiSSLVPN= res.data.results;
    }

    private async setSSLVPNConfiguration(config: FortiSSLVPN) {
        const res = await this.api.put('/api/v2/cmdb/vpn.ssl/settings', config);
    }

    private async getIPSecConfiguration() {
        // TODO: Implement me
    }

    private async setIPSecConfiguration() {
        //
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

    public async setVPNConfiguration(type: string, idx: number, config: any): Promise<void> {
        //
    }

    public async deleteVPNConfiguration(type: string, idx: number): Promise<void> {
        //
    }

    public async addVPNConfiguration(type: string, config: any): Promise<void> {
        //
    }
}

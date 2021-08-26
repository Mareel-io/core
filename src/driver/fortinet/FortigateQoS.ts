import { AxiosInstance } from "axios";
import { FortigateShaper } from "./util/types";

export class FortigateQoS {
    private api: AxiosInstance;
    
    constructor(api: AxiosInstance) {
        this.api = api
    }
    
    public async getQoSShaper() {
        const res = await this.api.get('/api/v2/cmdb/firewall.shaper/traffic-shaper');
        const shapers: FortigateShaper[] = res.data.results;
    }
    
    public async setQoSShaper() {
        //
    }
    
    public async getQoSPolicy(): Promise<void> {
        const res = await this.api.get('/api/v2/cmdb/firewall/shaping-policy')
    }
    
    public async createQoSPolicy(): Promise<void> {
        //
    }
    
    public async createQoSProfile(): Promise<void> {
        //
    }
    
    public async linkPolicyToProfile(): Promise<void> {
        //
    }
}

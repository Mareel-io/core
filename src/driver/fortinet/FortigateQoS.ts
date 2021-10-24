import { AxiosInstance } from "axios";
import { FortigateElement, FortigateShaper, FortigateShapingPolicy } from "./util/types";

export class FortigateQoS {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api
    }

    public async getQoSShaper() {
        const res = await this.api.get('/api/v2/cmdb/firewall.shaper/traffic-shaper');
        const shapers: FortigateShaper[] = res.data.results;
    }

    public async createQoSShaper() {
        //
    }

    public async updateQoSShaper() {
        //
    }

    public async deleteQoSShaper(target: FortigateElement) {
        await this.api.delete(`/api/v2/cmdb/firewall.shaper/traffic-shaper/${target.q_origin_key}`);
    }

    public async getQoSPolicy(): Promise<void> {
        const res = await this.api.get('/api/v2/cmdb/firewall/shaping-policy')
        const policies: FortigateShapingPolicy[] = res.data.results;
    }

    public async createQoSPolicy(): Promise<void> {
        const policy: FortigateShapingPolicy = {
            comment: "foobar",
            status: 'enable',
            'ip-version': '4',
            'srcaddr': [],
            'dstaddr': [],
            srcaddr6: [],
            dstaddr6: [],
             
        }
    }

    public async updateQoSPolicy(): Promise<void> {
        //
    }

    public async deleteQoSPolicy(target: FortigateElement): Promise<void> {
        await this.api.get(`/api/v2/cmdb/firewall/shaping-policy/${target.q_origin_key}`);
    }

    public async getQoSProfiles() {
        // TODO: Implement me
    }

    public async createQoSProfile(): Promise<void> {
        // TODO: Implement me
    }

    public async linkPolicyToProfile(): Promise<void> {
        // TODO: Implement me
    }
}

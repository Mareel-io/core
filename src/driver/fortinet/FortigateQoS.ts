import { AxiosInstance } from "axios";

interface FortigateShaper {
    name: string,
    q_origin_key?: string,
    "guaranteed-bandwidth": number | null,
    "maximum-bandwidth": number | null,
    "bandwidth-unit": 'kbps',
    priority: 'low' | 'medium' | 'high',
    "per-policy": 'enable' | 'disable' | null,
    diffserv: 'enable' | 'disable',
    diffservcode: string | null, // DSCP bitmask
    'dscp-marking-method': string,
    'exceed-bandwidth': number,
    'exceed-dscp': string, // DSCP bitmask
    'maximum-dscp': string, // DSCP bitmask
    overhead: number,
    'exceed-class-id': number,
}

export class FortigateQoS {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api
    };

    public async getQoSShaper() {
        const res = await this.api.get('/api/v2/cmdb/firewall.shaper/traffic-shaper');
        const shapers: FortigateShaper[] = res.data.results;
    }

    public async setQoSShaper() {
        //
    }

    public async getQoSPolicy(): Promise<void> {
        //
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

import { AxiosInstance } from "axios";

interface FortigateElement {
    name: string,
    q_origin_key?: string,
}

interface FortigateShaper extends FortigateElement {
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

interface FortigateShapingPolicy extends FortigateElement {
    id: number,
    comment: string,
    status: 'enable' | 'disable',
    "ip-version": '4' | '6',
    "srcaddr": FortigateElement[],
    "dstaddr": FortigateElement[],
    "srcaddr6": FortigateElement[],
    "dstaddr6": FortigateElement[],
    "internet-service": 'enable' | 'disable',
    "internet-service-name": [],
    "internet-service-group": [],
    "internet-service-custom": [],
    "internet-service-custom-group": [],
    "internet-service-src": "disable",
    "internet-service-src-name": [],
    "internet-service-src-group": [],
    "internet-service-src-custom": [],
    "internet-service-src-custom-group": [],
    "service": {name: string, q_origin_key: string}[],
    "schedule": string, // I don't know about it yet
    "users": [],
    "groups": [],
    "application": [],
    "app-category": [],
    "app-group": [],
    "url-category": [],
    "srcintf": FortigateElement[],
    "dstintf": FortigateElement[],
    "tos": "0x00",
    "tos-mask": "0x00",
    "tos-negate": 'enable' | 'disable',
    "traffic-shaper": string,
    "traffic-shaper-reverse": string,
    "per-ip-shaper": "",
    "class-id": 0,
    "diffserv-forward": 'enable' | 'disable',
    "diffserv-reverse": 'enable' | 'disable',
    "diffservcode-forward": string,
    "diffservcode-rev": string
}

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

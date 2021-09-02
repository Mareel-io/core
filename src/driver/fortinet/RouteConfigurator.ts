import { AxiosInstance } from "axios";
import { IPv4 } from "ipaddr.js";
import { MethodNotImplementedError } from "../../error/MarilError";
import { Route } from "../generic/Route";
import { RouteConfigurator as GenericRoutingConfigurator } from "../generic/RouteConfigurator";
import { FortigateRoute } from "./util/types";

export class RouteConfigurator extends GenericRoutingConfigurator {
    private api: AxiosInstance;
    
    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }
    
    private convertFromFortiV4Range(ipstr: string) {
        const ipaddrList = ipstr.split(' ');
        if (ipaddrList.length === 2) {
            const masklen = IPv4.parse(ipaddrList[1]).prefixLengthFromSubnetMask()
            if (masklen == null) throw new Error('Invalid dst netmask!');
            return `${ipaddrList[0]}/${masklen}`;
        } else {
            return '';
        }
    }

    private convertToFortiV4Range(ipstr: string) {
        const ipaddr = IPv4.parseCIDR(ipstr);
        const addr = ipaddr[0].toString();
        const netmask = IPv4.subnetMaskFromPrefixLength(ipaddr[1]);
        return `${addr} ${netmask}`;
    }
    
    public async getRoutes(): Promise<Route[]> {
        const res = await this.api.get('/api/v2/cmdb/router/static');
        const fortiRoutes: FortigateRoute[] = res.data.results;
        
        return fortiRoutes.map((elem): Route => {
            return {
                id: elem["seq-num"],
                type: 'ipv4', // TODO: Support IPv6
                dstaddr: this.convertFromFortiV4Range(elem.dst),
                srcaddr: this.convertFromFortiV4Range(elem.src),
                dstif: elem.device,
                gateway: elem.gateway,
                comment: elem.comment,
                enable: elem.status === 'enable',
                priority: elem.priority,
            } as Route;
        });
    }
    
    public async addRoute(route: Route): Promise<void> {
        if (route.type != 'ipv4') {
            throw new MethodNotImplementedError('IPv4 only for now.');
        }

        const payload: {[key: string]: number | string | []} = {
            status: route.enable ? 'enable' : 'disable',
            "distance":10,
            "weight":0,
            "priority": route.priority,
            "comment":"",
            "blackhole":"disable",
            "dynamic-gateway":"disable",
            "sdwan-zone":[],
            "dstaddr":"",
            "internet-service":0,
            "internet-service-custom":"",
            "link-monitor-exempt":"disable",
            "vrf":0,
            "bfd":"disable"
        }

        if (route.dstaddr != null) {
            payload.dst = this.convertToFortiV4Range(route.dstaddr);
        }

        if (route.srcaddr != null) {
            payload.src = this.convertToFortiV4Range(route.srcaddr);
        }

        if (route.gateway != null) {
            payload.gateway = route.gateway;
        }

        if (route.dstif != null) {
            payload.device = route.dstif;
        }

        await this.api.post('/api/v2/cmbd/router/static', payload);
    }
    
    public async deleteRoute(id: number): Promise<void> {
        await this.api.delete(`/api/v2/cmdb/router/static/${id}`);
    }
}

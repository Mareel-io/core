import { AxiosInstance } from "axios";
import { DNATRule, FirewallConfigurator as GenericFirewallConfigurator, FirewallEntry } from "../generic/FirewallConfigurator"
import { FortigateFirewall } from "./util/types";

export class FirewallConfigurator extends GenericFirewallConfigurator {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public async getFirewallConfiguration(): Promise<FirewallEntry[]> {
        const res = await this.api.get('/api/v2/cmdb/firewall/policy');
        const fortigateElement: FortigateFirewall[] = res.data.results;

        return fortigateElement.map((elem) => {
            if (elem.srcaddr == null)
            return {
                //
            }
        });
        throw new Error("Method not implemented.");
    }

    public setFirewallConfiguration(cfgs: FirewallEntry[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public getDNATRules(): Promise<DNATRule[]> {
        throw new Error("Method not implemented.");
    }

    public setDNATRules(rules: DNATRule[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

import { AxiosInstance } from "axios";
import { DNATRule, FirewallConfigurator as GenericFirewallConfigurator, FirewallEntry } from "../generic/FirewallConfigurator"

export class FirewallConfigurator extends GenericFirewallConfigurator {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public getFirewallConfiguration(): Promise<FirewallEntry[]> {
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

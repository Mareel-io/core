import { FirewallConfigurator as EFMFirewallConfigurator } from '../../driver/efm/FirewallConfigurator';
import { FirewallConfigurator as GenericFirewallConfigurator, FirewallEntry, DNATRule } from '../../driver/generic/FirewallConfigurator';
import { RPCMethodTable, RPCRequestHandler } from './RPCRequestHandler';

export class FirewallConfiguratorReqHandler extends RPCRequestHandler {
    private firewallConfigurator: GenericFirewallConfigurator | EFMFirewallConfigurator;
    protected rpcMethodTable: RPCMethodTable = {
        getFirewallConfiguration: async(): Promise<FirewallEntry[]> => {
            return await this.firewallConfigurator.getFirewallConfiguration();
        },
        setFireawllConfiguration: async(cfgs: FirewallEntry[]): Promise<void> => {
            await this.firewallConfigurator.setFirewallConfiguration(cfgs);
        },
        getDNATRules: async(): Promise<DNATRule[]> => {
            return await this.firewallConfigurator.getDNATRules();
        },
        setDNATRules: async(rules: DNATRule[]): Promise<void> => {
            await this.firewallConfigurator.setDNATRules(rules);
        },
    };

    constructor(deviceId: string, firewallConfigurator: GenericFirewallConfigurator | EFMFirewallConfigurator) {
        super(deviceId, 'FirewallConfigurator');
        this.firewallConfigurator = firewallConfigurator;
    }

    async init(): Promise<void> {
        // TODO: Implement me
    }
}

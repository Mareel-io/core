import { DNATRule, FirewallConfigurator, FirewallEntry } from '../../driver/generic/FirewallConfigurator';
import { RPCProvider } from '../jsonrpcv2';

export class RPCFirewallConfigurator extends FirewallConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getFirewallConfiguration(): Promise<FirewallEntry[]> {
        return (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'FirewallConfigurator',
            method: 'getFirewallConfiguration',
            params: [],
        })) as FirewallEntry[];
    }

    public async setFirewallConfiguration(cfgs: FirewallEntry[]): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'FirewallConfigurator',
            method: 'setFirewallConfiguration',
            params: [cfgs],
        });
    }

    public async getDNATRules(): Promise<DNATRule[]> {
        return (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'FirewallConfigurator',
            method: 'getDNATRules',
            params: [],
        })) as DNATRule[];
    }

    public async setDNATRules(rules: DNATRule[]): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'FirewallConfigurator',
            method: 'setDNATRules',
            params: [rules],
        });
    }
}

import { FirewallConfigurator as EFMFirewallConfigurator } from '../../driver/efm/FirewallConfigurator';
import { FirewallConfigurator as GenericFirewallConfigurator } from '../../driver/generic/FirewallConfigurator';
import { RPCMethodTable, RPCRequestHandler } from './RPCRequestHandler';

export class FirewallConfiguratorReqHandler extends RPCRequestHandler {
    private firewallConfigurator: GenericFirewallConfigurator | EFMFirewallConfigurator;
    protected rpcMethodTable: RPCMethodTable = {
    };

    constructor(deviceId: string, firewallConfigurator: GenericFirewallConfigurator | EFMFirewallConfigurator) {
        super(deviceId);
	this.firewallConfigurator = firewallConfigurator;
    }

    async init(): Promise<void> {
    }
}

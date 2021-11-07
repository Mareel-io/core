import { VPNConfigurator } from "../../driver/generic/VPNConfigurator";
import { RPCMethodTable, RPCRequestHandler } from "./RPCRequestHandler";

export class VPNConfiguratorReqHandler extends RPCRequestHandler {
    private vpnConfigurator: VPNConfigurator;
    protected rpcMethodTable: RPCMethodTable = {
        getVPNConfigurations: async(type: string): Promise<any[]> => {
            return await this.vpnConfigurator.getVPNConfigurations(type);
        },
        setVPNConfiguration: async(type: string, idx: number, config: any): Promise<void> => {
            await this.vpnConfigurator.setVPNConfiguration(type, idx, config);
        },
        deleteVPNConfiguration: async(type: string, idx: number): Promise<void> => {
            await this.vpnConfigurator.deleteVPNConfiguration(type, idx);
        },
        addVPNConfiguration: async(type: string, config: any): Promise<void> => {
            await this.vpnConfigurator.addVPNConfiguration(type, config);
        },
    }

    constructor(deviceId: string, vpnConfigurator: VPNConfigurator) {
        super(deviceId, 'VPNConfigurator');
        this.vpnConfigurator = vpnConfigurator;
    }

    public async init(): Promise<void> {
        //
    }
}
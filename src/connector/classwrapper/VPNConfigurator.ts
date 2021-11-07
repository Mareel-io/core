import { VPNConfigurator as GenericVPNConfigurator } from "../../driver/generic/VPNConfigurator";
import { RPCProvider } from "../jsonrpcv2";

export class RPCVPNConfigurator extends GenericVPNConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getVPNConfigurations(type: string): Promise<any[]> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'VPNConfigurator',
            method: 'getVPNConfigurations',
            params: [],
        }) as Promise<any[]>;
    }
    public async setVPNConfiguration(type: string, idx: number, config: any): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'VPNConfigurator',
            method: 'setVPNConfiguration',
            params: [type, idx, config],
        });
    }
    public async deleteVPNConfiguration(type: string, idx: number): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'VPNConfigurator',
            method: 'deleteVPNConfiguration',
            params: [type, idx],
        });
    }
    public async addVPNConfiguration(type: string, config: any): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'VPNConfigurator',
            method: 'addVPNConfiguration',
            params: [type, config],
        });
    }
    //
}
import { GenericAuthConfigurator } from "../../driver/generic/AuthConfigurator";
import { RADIUS, RADIUSAuthMethod } from "../../driver/generic/RADIUS";
import { RPCProvider } from "../jsonrpcv2";

export class RPCAuthConfigurator extends GenericAuthConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getRADIUSServers(): Promise<{ id: string; servers: RADIUS[]; authMethod: RADIUSAuthMethod; }[]> {
        return (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'AuthConfigurator',
            method: 'getRADIUSServers',
            params: [],
        })) as ({id: string, servers: RADIUS[], authMethod: RADIUSAuthMethod}[]);
    }

    public async addRADIUSServer(name: string, method: RADIUSAuthMethod, servers: RADIUS[]): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'AuthConfigurator',
            method: 'addRADIUSServer',
            params: [name, method, servers],
        });
    }

    public async deleteRADIUSServer(id: string): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'AuthConfigurator',
            method: 'addRADIUSServer',
            params: [id],
        });
    }
}

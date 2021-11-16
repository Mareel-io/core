import { GenericProfileManager, GenericUserGroupProfile } from "../../driver/generic/ProfileManager";
import { RPCProvider } from "../jsonrpcv2";

export class RPCProfileManager extends GenericProfileManager {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getAvailableProfiles(): Promise<string[]> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'ProfileManager',
            method: 'getAvailableProfiles',
            params: [],
        }) as string[];
    }

    public async createUserGroupProfile(profile: GenericUserGroupProfile): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserGroupProfiles(id?: string): Promise<GenericUserGroupProfile[]> {
        throw new Error("Method not implemented.");
    }

    public async removeUserGroupProfile(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

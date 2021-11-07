import { GenericAuthConfigurator } from "../../driver/generic/AuthConfigurator";
import { RADIUS, RADIUSAuthMethod } from "../../driver/generic/RADIUS";
import { RPCMethodTable, RPCRequestHandler } from "./RPCRequestHandler";

export class AuthConfiguratorReqHandler extends RPCRequestHandler {
    private authConfigurator: GenericAuthConfigurator;
    protected rpcMethodTable: RPCMethodTable = {
        getRADIUSServers: async(): Promise<{id: string, servers: RADIUS[], authMethod: RADIUSAuthMethod}[]> => {
            return await this.authConfigurator.getRADIUSServers();
        },
        addRADIUSServer: async(name: string, method: RADIUSAuthMethod, servers: RADIUS[]): Promise<void> => {
            await this.authConfigurator.addRADIUSServer(name, method, servers);
        },
        deleteRADIUSServer: async(id: string): Promise<void> => {
            await this.authConfigurator.deleteRADIUSServer(id);
        }
    };

    constructor(deviceId: string, authConfigurator: GenericAuthConfigurator) {
        super(deviceId, 'AuthConfigurator');
        this.authConfigurator = authConfigurator;
    }

    async init(): Promise<void> {
        // TODO: Implement me
    }
}
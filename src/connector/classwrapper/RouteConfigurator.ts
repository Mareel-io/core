import { Route } from "../../driver/generic/Route";
import { RouteConfigurator as GenericRouteConfigurator } from "../../driver/generic/RouteConfigurator";
import { RPCProvider } from "../jsonrpcv2";

export class RPCRouteConfigurator extends GenericRouteConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getRoutes(): Promise<Route[]> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'RouteConfigurator',
            method: 'getRoutes',
            params: [],
        }) as Route[];
    }

    public async addRoute(route: Route): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'RouteConfigurator',
            method: 'addRoute',
            params: [route],
        });
    }

    public async deleteRoute(id: number): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'RouteConfigurator',
            method: 'deleteRoute',
            params: [id],
        });
    }
}

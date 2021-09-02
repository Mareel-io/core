import { RouteConfigurator as FortigateRouteConfigurator } from "../../driver/fortinet/RouteConfigurator";
import { Route } from "../../driver/generic/Route";
import { RouteConfigurator as GenericRouteConfigurator } from "../../driver/generic/RouteConfigurator";
import { RPCMethodTable, RPCRequestHandler } from "./RPCRequestHandler";

export class RouteConfiguratorReqHandler extends RPCRequestHandler {
    private routeCfg: GenericRouteConfigurator;
    protected rpcMethodTable: RPCMethodTable = {
        getRoutes: async(): Promise<Route[]> => {
            return await this.routeCfg.getRoutes();
        },
        addRoute: async(route: Route): Promise<void> => {
            await this.routeCfg.addRoute(route);
        },
        deleteRoute: async(id: number): Promise<void> => {
            await this.routeCfg.deleteRoute(id);
        },
    };

    constructor(deviceId: string, routeConfigurator: GenericRouteConfigurator) {
        super(deviceId, 'RouteConfigurator');
        this.routeCfg = routeConfigurator;
    }

    async init(): Promise<void> {
        // TODO: Implement me
    }
}

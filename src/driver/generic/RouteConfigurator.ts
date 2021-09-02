import { Route } from "./Route";

export abstract class RouteConfigurator {
    public abstract getRoutes(): Promise<Route[]>;
    public abstract addRoute(route: Route): Promise<void>;
    public abstract deleteRoute(id: number): Promise<void>;
}

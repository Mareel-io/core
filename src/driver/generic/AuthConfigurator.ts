import { RADIUS, RADIUSAuthMethod } from "./RADIUS";

export abstract class GenericAuthConfigurator {
    public abstract getRADIUSServers(): Promise<{id: string, servers: RADIUS[], authMethod: RADIUSAuthMethod}[]>;
    public abstract addRADIUSServer(name: string, method: RADIUSAuthMethod, servers: RADIUS[]): Promise<void>;
    public abstract deleteRADIUSServer(id: string): Promise<void>;
}
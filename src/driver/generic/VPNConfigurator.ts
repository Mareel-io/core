export abstract class VPNConfigurator {
    public abstract getVPNConfigurations(type: string): Promise<any[]>;
    public abstract setVPNConfiguration(type: string, idx: number, config: any): Promise<void>;
    public abstract deleteVPNConfiguration(type: string, idx: number): Promise<void>;
    public abstract addVPNConfiguration(type: string, config: any): Promise<void>;
}
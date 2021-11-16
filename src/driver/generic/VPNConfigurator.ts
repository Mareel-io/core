export interface SSLVPN {
    ssl?: {
        maxProto: string,
        milProto: string,
        allowedCipher?: string,
        bannedCipher?: string,
    },
    port: number,
}

export interface IPSECVPN {
    // TODO: Implement me.
}

export abstract class VPNConfigurator {
    public abstract getVPNConfigurations(type: string): Promise<any[]>;
    public abstract setVPNConfiguration(type: string, idx: number, config: SSLVPN | IPSECVPN): Promise<void>;
    public abstract deleteVPNConfiguration(type: string, idx: number): Promise<void>;
    public abstract addVPNConfiguration(type: string, config: SSLVPN | IPSECVPN): Promise<void>;
}

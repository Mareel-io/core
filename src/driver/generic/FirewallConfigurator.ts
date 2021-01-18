export interface DNATRule {
    name: string,
    src: string,
    src_dport: number,
    dest: string,
    dest_ip: string,
    dest_port: 22,
    proto: 'tcp' | 'udp',
}

export abstract class FirewallConfigurator {
    public abstract getDNATRules(): Promise<[DNATRule]>;
    public abstract setDNATRules(rules: [DNATRule]): Promise<void>;
}
export interface FirewallEntry {
    /** rule name (human readable) */
    name: string,
    /** source zone */
    src?: string,
    /** Source IP address. */
    src_ip?: string,
    /** Source MAC address. */
    src_mac?: string,
    /** Source port */
    src_port?: number | string,
    /** Protocol */
    proto: 'all' | 'tcp' | 'udp' | 'igmp', // Or whatever. Need to research more
    icmp_type?: string,
    dest?: string,
    dest_ip?: string,
    dest_port?: number | string,
    ipset?: string,
    mark?: number,
    target?: string,
    set_mark?: number,
    set_xmark?: number,
    family: 'any' | 'ipv4' | 'ipv6',
    enabled: boolean,
}

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
    public abstract getFirewallConfiguration(): Promise<FirewallEntry[]>;
    public abstract setFirewallConfiguration(cfgs: FirewallEntry[]): Promise<void>;
    public abstract getDNATRules(): Promise<DNATRule[]>;
    public abstract setDNATRules(rules: DNATRule[]): Promise<void>;
}
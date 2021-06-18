export interface FirewallEntry {
    /** rule name (human readable) */
    name: string,
    /** source zone */
    src: string | undefined | null,
    /** Source IP address. */
    src_ip: string | undefined | null,
    /** Source MAC address. */
    src_mac: string | undefined | null,
    /** Source port */
    src_port: number | string | undefined | null,
    /** Protocol */
    proto: 'all' | 'tcp' | 'udp' | 'igmp', // Or whatever. Need to research more
    icmp_type: string | undefined | null,
    dest: string | undefined | null,
    dest_ip: string | undefined | null,
    dest_port: number | string | undefined | null,
    ipset: string | undefined | null,
    mark: number | undefined | null,
    target: string | undefined | null,
    set_mark: number | undefined | null,
    set_xmark: number | undefined | null,
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
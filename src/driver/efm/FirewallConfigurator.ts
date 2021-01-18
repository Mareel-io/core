import { AxiosInstance } from 'axios';
import { Grammar, Parser } from 'nearley';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as EFMFirewallGrammar from '../../grammar/efm/firewall';

/**
 * 
 */
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
    src_port: number | undefined | null,
    /** Protocol */
    proto: 'all' | 'tcp' | 'udp' | 'igmp', // Or whatever. Need to research more
    icmp_type: string | undefined | null,
    dest: string | undefined | null,
    dest_ip: string | undefined | null,
    dest_port: string | undefined | null,
    ipset: string | undefined | null,
    mark: number | undefined | null,
    target: string | undefined | null,
    set_mark: number | undefined | null,
    set_xmark: number | undefined | null,
    family: 'any' | 'ipv4' | 'ipv6',
    enabled: boolean,
}

interface ParserEntry {
    type: string,
    key: string | undefined,
    value: string,
}

interface Section {
    section: string,
    kvps: [ParserEntry]
}

/**
 * Firewall configurator class
 */
export class FirewallConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        this.api = api;
    }

    protected analyzeFirewallConfig(parserOutput: Section | ParserEntry | [ParserEntry], acc = {} as any): void {
        if (!(parserOutput instanceof Array)) {
            if ((parserOutput as ParserEntry).type === 'section') {
                // Section
            }
        } else {
            //
        }
    }

    public async getFirewallConfiguration(): Promise<[FirewallEntry]> {
        let res = null;
        try {
            res = await this.api.get('/sess-bin/download_firewall.cgi');
        } catch(e) {
            // TODO: Match error if it is 502 or not
            // if 502, it means the configuration is empty.
            return [] as unknown as [FirewallEntry];
        }

        const firewallParser = new Parser(Grammar.fromCompiled(EFMFirewallGrammar))
        firewallParser.feed(res.data);
        const rules = firewallParser.results[0]; // Use first result only

        // Dirty quick data extraction
        for (const rule of rules) {
            const section = rule as ParserEntry | [ParserEntry];
            if (!(section instanceof Array)) {
                //
            } else if (section[0].type == 'token') {
                // Recurse!
            }
            console.log(section);
        }
        return [] as unknown as [FirewallEntry];
    }

    public async setFirewallConfiguration(cfgs: [FirewallEntry]):Promise<void> {
        let firewallCfg = `Type=firewall # Do not modify
Version=1.0.0 # Do not modify
lang=utf-8 # Do not modify
`;
        
        for (const i of cfgs) {
            const enabled = i.enabled ? 1 : 0;
            const direction = i.dest == 'WAN' ? 'out' : 'in';
            const srcType = i.src_mac != null ? 'mac' : 'ip'
            const section = `
[${i.name}]
enable = ${enabled}
flag = 0
schedule = 0000000 0000 0000
{
    direction = ${direction}
    src_type = ${srcType}
    src_${srcType}_address = ${srcType == 'mac' ? i.src_mac : i.src_ip}
    protocol = ${i.proto /*TODO: ResearchME*/}
    policy = drop
}
`;

            firewallCfg += section;
        }
        // 
    }
}
import { AxiosInstance } from 'axios';
import { Grammar, Parser } from 'nearley';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as EFMFirewallGrammar from '../../grammar/efm/firewall';

export interface FirewallEntry {
    name: string,
    src: string | undefined | null,
    src_ip: string | undefined | null,
    src_mac: string | undefined | null,
    src_port: number | undefined | null,
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

export class FirewallConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        this.api = api;
    }

    public async getFirewallConfiguration(): Promise<[FirewallEntry]> {
        let res = null;
        try {
            //
            res = await this.api.get('/sess-bin/download_firewall.cgi');
        } catch(e) {
            // TODO: Match error if it is 502 or not
            // if 502, it means the configuration is empty.
            return [] as unknown as [FirewallEntry];
        }

        const firewallParser = new Parser(Grammar.fromCompiled(EFMFirewallGrammar))
        firewallParser.feed(res.data);
        const rules = firewallParser.results;

        console.log(JSON.stringify(rules));
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
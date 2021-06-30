import { AxiosInstance } from 'axios';
import { Grammar, Parser } from 'nearley';
import { MarilError, UnsupportedFeatureError } from '../../error/MarilError';
import { DNATRule, FirewallEntry, FirewallConfigurator as GenericFirewallConfigurator } from '../generic/FirewallConfigurator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as EFMFirewallGrammar from '../../grammar/efm/firewall';
import FormData from 'form-data';
import { MethodNotAvailableError } from '../../connector/jsonrpcv2';

interface ParserEntry {
    type: string,
    key: string,
    value: string,
}

interface Section {
    section: string,
    kvps: [ParserEntry]
}

/**
 * Firewall configurator class
 */
export class FirewallConfigurator extends GenericFirewallConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    /**
     * Transform firewall parser output into object
     * 
     * @param parserOutput - Parser output data
     * @param acc - Accumulator which will hold analyzed result.
     */
    protected analyzeFirewallConfig(parserOutput: Section | ParserEntry | ParserEntry[], acc: {section: string, kvps: ParserEntry[]}[]): ParserEntry[] {
        if (!(parserOutput instanceof Array)) {
            if (typeof (parserOutput as Section).section === 'string') {
                // it is section
                let arr = [] as ParserEntry[];
                for (const elem of (parserOutput as Section).kvps) {
                    // TODO: Do something with ACC & return
                    arr = [...arr, ...(this.analyzeFirewallConfig(elem, acc))];
                }

                acc.push({
                    section: (parserOutput as Section).section,
                    kvps: arr,
                });
                return arr;
            } else if ((parserOutput as ParserEntry).type === 'kvp') {
                // it is kvp
                return [parserOutput as ParserEntry]
            } else {
                // How have you been here?
                throw new MarilError('Invalid parser data structure.');
            }
        } else {
            // Hey, it is array!
            let arr = [] as ParserEntry[];
            for (const elem of parserOutput) {
                // TODO: Do something with ACC & return
                arr = [...arr, ...(this.analyzeFirewallConfig(elem, acc))];
            }
            return arr;
        }
    }

    /**
     * Transform parser entries into (internal) firewall config objects
     * 
     * @param section - Firewall entry name
     * @param ents - Firewall entries from parser
     */
    protected translateFirewallCfg(section: string, ents: ParserEntry[]): FirewallEntry[] {
        const map = ents.reduce((acc: {[key: string]: string}, ent: ParserEntry): {[key: string]: string} => {
            acc[ent.key] = ent.value;
            return acc;
        }, {});

        const elem = {
            name: section,
        } as FirewallEntry;

        let src = null as string | null;
        if (map.src_type === 'ip') {
            src = map.src_ip_address;
        } else if (map.src_type === 'mac') {
            src = map.src_mac_address;
        } else {
            // Huh? Please report to us.
            throw new MarilError('Bad value!');
        }

        if (map.direction === 'inout') {
            elem.src = 'LAN';
            elem.dest = 'WAN';
            if (map.src_type === 'ip') {
                elem.src_ip = src;
            } else {
                elem.src_mac = src;
            }
            elem.dest_ip = map.dest_ip_address;
            elem.dest_port = map.port;
        } else if (map.direction === 'outin') {
            elem.src = 'WAN';
            elem.dest = 'LAN';
            elem.dest_ip = src;
            elem.src_ip = map.dest_ip_address;
            elem.src_port = map.port;
        } else {
            // TODO: Handle this
            console.error('[WARN] both direction is not supported yet...');
            return [];
        }

        if (map.enable === '1') {
            elem.enabled = true;
        } else {
            elem.enabled = false;
        }

        // Override
        (elem.proto as string) = map.protocol;
        elem.target = map.policy.toUpperCase();

        return [elem];
    }

    /**
     * Get current fireall configuration
     */
    public async getFirewallConfiguration(): Promise<FirewallEntry[]> {
        let res = null;
        try {
            res = await this.api.get('/sess-bin/download_firewall.cgi');
        } catch(e) {
            // TODO: Match error if it is 502 or not
            // if 502, it means the configuration is empty.
            return [] as FirewallEntry[];
        }

        const firewallParser = new Parser(Grammar.fromCompiled(EFMFirewallGrammar))
        firewallParser.feed(res.data);
        const rules = firewallParser.results[0]; // Use first result only

        const acc = [] as {section: string, kvps: ParserEntry[]}[];
        this.analyzeFirewallConfig(rules, acc);

        let ret = [] as FirewallEntry[];
        for (const section of acc) {
            ret = [...ret, ...(this.translateFirewallCfg(section.section, section.kvps))];
        }

        return ret;
    }

    /**
     * Set firewall configuration using given firewall entries
     * 
     * Supported features are:
     * 
     * * name: Rule alias
     * * src : Source zone. LAN or WAN is accepted in ipTIME
     * * src_ip: Source IP address (or range)
     * * src_mac: Source MAC address (or range) (only one will be active)
     * * src_port: Source port. Depends on direction, only src_port or dest_port will work.
     * * proto: Protocol
     * * icmp_type: ICMP type. not supported in ipTIME.
     * * dest: Destination zone. LAN or WAN is accepted in ipTIME
     * * dest_ip: Destination IP address
     * * dest_port: Destination port. Depends on direction, only src_port or dest_port will work.
     * * ipset: Not supported in ipTIME.
     * * mark: Not supported in ipTIME.
     * * target: only ACCEPT or DROP is supported in ipTIME.
     * * set_mark: Not supported in ipTIME.
     * * set_xmark: Not supported in ipTIME.
     * * family: 'any' and 'ipv4' is supported in ipTIME. ipTIME firmware does not support ipv6.
     * * enabled: Enable rule or not.
     * 
     * @param cfgs - Firewall entries
     */
    public async setFirewallConfiguration(cfgs: FirewallEntry[]): Promise<void> {
        let firewallCfg = `Type=firewall # Do not modify
Version=1.0.0 # Do not modify
lang=utf-8 # Do not modify
`;
        
        for (const cfg of cfgs) {
            let section = `
[${cfg.name}]
enable = ${cfg.enabled ? 1 : 0}
flag = 0
schedule = 0000000 0000 0000
{
`;

            // Generate elements for it
            // Field desc
            // direction = inout | outin | both
            // src_type = ip | mac
            // src_ip_address = <ipaddr> | <ipaddr>-<ipaddr> # NOTE THAT IT MEANS DEST ADDR WHEN DIRECTION IS OUTIN
            // src_mac_address = <macaddr>
            // dest_ip_address = <ipaddr> | <ipaddr>-<ipaddr> # NOTE THAT IT MEANS SRC ADDR WHEN DIRECTION IS OUTIN
            // protocol = none | tcp | udp | icmp | gre | tcpudp
            // port = <number> | <number>-<number>
            // policy = drop | accept

            const srcType = cfg.src_mac != null ? 'mac' : 'ip'
            const srcTarget = srcType == 'mac' ? cfg.src_mac : cfg.src_ip;
            if (cfg.family == 'ipv6') {
                throw new UnsupportedFeatureError('EFM device does not support ipv6 at all.');
            }

            if (cfg.src_mac != null && cfg.src_ip != null) {
                throw new UnsupportedFeatureError('You cannot specify src_mac and src_ip at the same time in EFM device.');
            }

            section += `    src_type = ${srcType}\n`

            if (cfg.dest == 'WAN' && cfg.src == 'LAN') {
                section += '    direction = inout\n';
                section += `    src_${srcType}_address = ${srcTarget}\n`
                if (cfg.dest_ip != null) {
                    section += `    dest_ip_address = ${cfg.dest_ip}\n`;
                }
            } else if(cfg.dest == 'LAN' && cfg.src == 'WAN') {
                section += '    direction = outin\n';
                section += `    dest_${srcType}_address = ${srcTarget}\n`;
                if (cfg.dest_ip != null) {
                    section += `    src_ip_address = ${cfg.src_ip}\n`;
                }
            } else {
                throw new UnsupportedFeatureError('EFM device does not support zones other then WAN and LAN');
            }

            if (cfg.proto != null) {
                section += `    protocol = ${cfg.proto}\n`;
            }

            if (cfg.dest_port != null) {
                section += `    port = ${cfg.dest_port}\n`;
            }

            if (cfg.target != null) {
                section += `    policy = ${cfg.target.toLowerCase()}\n`;
            }

            section += '}\n';

            firewallCfg += section;
        }

        const form = new FormData();
        form.append('tmenu', 'iframe');
        form.append('smenu', 'restore_firewall');
        form.append('commit', 'fw_restore');
        form.append('fw_restore_file', Buffer.from(firewallCfg), {
            filename: 'maril.cfg',
        });

        // Calculate length for form multipart data
        const length = await new Promise((res, rej) => {
            form.getLength((err, len) => {
                if (err != null) {
                    rej(err);
                    return;
                }

                res(len);
            });
        });

        // Now, ready to POST
        const result = await this.api.post('/sess-bin/timepro.cgi', form, {headers: {
            'Content-Length': length,
            ...form.getHeaders()
        }});

        const chkFail = result.data.match(/규칙 복원에 실패하였습니다/);

        if (chkFail != null) {
            throw new MarilError('Unknown error occured while applying firewall rules.');
        }
    }

    public async getDNATRules(): Promise<DNATRule[]> {
        throw new MethodNotAvailableError();
    }

    public async setDNATRules(rules: DNATRule[]): Promise<void> {
        throw new MethodNotAvailableError();
    }
}

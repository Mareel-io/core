import { AxiosInstance } from 'axios';
import { Grammar, Parser } from 'nearley';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as EFMFirewallGrammar from '../../grammar/efm/firewall';

export interface firewallConfiguration {
    //
}

export class FirewallConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        this.api = api;
    }

    public async getFirewallConfiguration(): Promise<void> {
        let res = null;
        try {
            //
            res = await this.api.get('/sess-bin/download_firewall.cgi');
        } catch(e) {
            // TODO: Match error if it is 502 or not
            // if 502, it means the configuration is empty.
            return;
        }

        const firewallParser = new Parser(Grammar.fromCompiled(EFMFirewallGrammar))
        firewallParser.feed(res.data);
        const rules = firewallParser.results;

        console.log(JSON.stringify(rules));
    }

    public async setFirewallConfiguration(): Promise<void> {
        const firewalLTemplate = `Type=firewall # Do not modify
Version=1.0.0 # Do not modify
lang=utf-8 # Do not modify
`;
        // TODO: Implement me.
    }
}
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

import {readdirSync, readFileSync} from 'fs';
import * as assert from 'assert';
import { Grammar, Parser } from 'nearley';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as EFMFirewallGrammar from '../src/grammar/efm/firewall';
import {FirewallConfigurator} from '../src/driver/efm/FirewallConfigurator';
import axios from 'axios';

const grammar = Grammar.fromCompiled(EFMFirewallGrammar);

const files = readdirSync('./test/data/efm/firewall').map((name) => {
    return {
        name: name,
        data: readFileSync(`./test/data/efm/firewall/${name}`).toString(),
    };
});

class FirewallConfiguratorTestFixture extends FirewallConfigurator {
    constructor() {
        super(axios.create());
    }

    public analyzeFirewallConfigTest(arg: any) {
        const acc = [] as any[];
        this.analyzeFirewallConfig(arg, acc)
        console.log(acc);
    }
}

describe('Parser', () => {
    for (const file of files) {
        it(`Test: ${file.name}`, () => {
            const testFixture = new FirewallConfiguratorTestFixture();
            const firewallParser = new Parser(grammar);
            firewallParser.feed(file.data);
            const rules = firewallParser.results[0];
            testFixture.analyzeFirewallConfigTest(rules)
        })
    }
})
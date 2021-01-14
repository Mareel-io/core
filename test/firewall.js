/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const fs = require('fs');
const assert = require('assert');
const { Grammar, Parser } = require('nearley');
const EFMFirewallGrammar = require('../src/grammar/efm/firewall');

const grammar = Grammar.fromCompiled(EFMFirewallGrammar);

const files = fs.readdirSync('./test/data/efm/firewall').map((name) => {
    return {
        name: name,
        data: fs.readFileSync(`./test/data/efm/firewall/${name}`).toString(),
    };
});

describe('Parser', () => {
    for (const file of files) {
        it(`Test: ${file.name}`, () => {
            const firewallParser = new Parser(grammar);
            firewallParser.feed(file.data);
        })
    }
})
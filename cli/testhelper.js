#!/usr/bin/env node
require('source-map-support').install();

const testproxy = require('../dist/testhelper/testproxy');
testproxy.start(4000);

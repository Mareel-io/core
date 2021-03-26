const maril = require('../dist');

async function main() {
    const mibLoader = new maril.MIBLoader('./cisco.json');
    mibLoader.init();
}

main();
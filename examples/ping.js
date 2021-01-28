const maril = require('../dist');

async function main() {
    //const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    const efmController = new maril.EFMControllerFactory('http://10.64.0.15/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const netTester = efmController.getNetTester();

    console.log(await netTester.testNetwork('icmp_ping', '1.1.1.1'));
}

main();

const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    await efmController.authenticate({id: 'admin', pass: 'admin'});
    const logman = efmController.getLogman()
    console.log(await logman.queryLog('syslog'));
}

main();

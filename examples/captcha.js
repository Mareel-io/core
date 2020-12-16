const maril = require('../');

async function main() {
    const efmController = new maril.EFMControllerFactory('http://192.168.0.1/');
    const resp = await efmController.getCaptchaChallenge();
    console.log(resp);
}

main();

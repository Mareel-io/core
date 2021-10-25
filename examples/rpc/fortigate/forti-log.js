const mareel = require('../../../dist');
const WebSocket = require('ws');
require('../../common/errorhandler');

const wss = new WebSocket.Server({ port: 3000 });
console.log('Listening!');

wss.on('connection', async function connection(ws) {
    console.log('Connected.');
    const rpcControllerFactory = new mareel.RPCControllerFactory(ws, [{
        id: 'e0716e17-23b9-448d-8de9-3fa5c8b95967',
        addr: 'https://127.0.0.1:3000',
        type: 'fortinet',
        credential: {
            type: 'token',
            allowInvalidCertificate: true,
            credential: 'jkhny7h5ycdNsm5xrmxQ1kntwy9dj0',
        },
    }]);

    await rpcControllerFactory.authenticate();
    console.log('Authenticated.');
    // NOTE: this may throw exception when the configuration is differ from
    // cached one
    try {
        await rpcControllerFactory.init();
    } catch(e) {
        console.log(e);
        return;
    }
    console.log('Initialized.');

    const logman = rpcControllerFactory.getLogman();
    const logs = await logman.queryLog('system');
    console.log(logs);
});

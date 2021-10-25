const mareel = require('../../../dist');
const WebSocket = require('ws');
require('../../common/errorhandler');

// It is implementor's duty to implement proper authentication
// and identification on WebSocket server.
// In this example, just trust all connection and ignore
// 
const wss = new WebSocket.Server({ port: 3000 });
console.log('Listening!');

wss.on('connection', async function connection(ws) {
    console.log('Connected.');
    const rpcControllerFactory = new mareel.RPCControllerFactory(ws, [{
        id: 'f265a9b2-13cd-43a7-85d2-2f6ac24d0963',
        addr: '192.168.1.3',
        type: 'cisco',
        credential: {
            snmpCredential: {
                id: 'admin',
                authProtocol: 'sha',
                authKey: '4f5ACmTA9aT3rQ7!',
                privacyProtocol: 'aes',
                privacyKey: '4f5ACmTA9aT3rQ7!'
            },
            sshCredential: {
                user: 'admin',
                password: '4f5ACmTA9aT3rQ7!'
            }
        }
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
    
    const devices = rpcControllerFactory.getDevices();


    const logman = rpcControllerFactory.getLogman(devices[0].id);
    const logsrc = await logman.getAvailableSources();
    console.log(logsrc);
    const log = logman.queryLog('flash');
    console.log(log);
});
const maril = require('../');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', async function connection(ws) {
    console.log('connected.');

    const rpcControllerFactory = new maril.RPCControllerFactory(ws, [{
        id: '1e24ee29-7284-42a8-962b-2365e113a69b',
        addr: '0.0.0.0',
        type: 'dummy',
        Credential: null,
    }]);
    await rpcControllerFactory.authenticate();
  
    console.log('Authenticated.');
    await rpcControllerFactory.init();
    console.log('Initialized.');

    const devices = rpcControllerFactory.getDevices();
    console.log(devices);  

    const switchConfigurator = rpcControllerFactory.getSwitchConfigurator(devices[0].id);
    console.log('foobar');
    await switchConfigurator.loadConfig();
    console.log('foo');
    const vlans = await switchConfigurator.getAllVLAN();
    console.log(vlans);
});

const maril = require('../../dist');
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
    console.log(devices);  

    const switchConfigurator = rpcControllerFactory.getSwitchConfigurator(devices[0].id);
    console.log('foobar');
    await switchConfigurator.loadConfig();
    const vlans = await switchConfigurator.getAllVLAN();
    console.log(vlans);
});

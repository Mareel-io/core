const maril = require('../');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', async function connection(ws) {
    console.log('connected.');

    const rpcControllerFactory = new maril.RPCControllerFactory(ws);
    await rpcControllerFactory.authenticate();
  
    console.log('Authenticated.');
    await rpcControllerFactory.init();
    console.log('Initialized.');

    const devices = rpcControllerFactory.getDevices();
    console.log(devices);  

    const switchConfigurator = rpcControllerFactory.getSwitchConfigurator(devices[0].id);
    const vlans = await switchConfigurator.getAllVLAN();
    console.log(vlans);
});
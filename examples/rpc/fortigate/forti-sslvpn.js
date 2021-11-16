const mareel = require('../../../dist');
const WebSocket = require('ws');
require('../../common/errorhandler');

const wss = new WebSocket.Server({ port: 3000 });
console.log('Listening!');

wss.on('connection', async function connection(ws) {
    console.log('Connected.');
    const rpcControllerFactory = new mareel.RPCControllerFactory(ws, [{
        id: 'e0716e17-23b9-448d-8de9-3fa5c8b95967',
        addr: 'https://127.0.0.1:8443',
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

    const devices = rpcControllerFactory.getDevices();
    const deviceId = devices[0].id;
    const vpnConfigurator = rpcControllerFactory.getVPNConfigurator(deviceId);

    await vpnConfigurator.setVPNConfiguration('fortissl', {
        ssl: {
            maxProto: 'tls1-3',
            minProto: 'tls1-2',
        },
        port: 444,
        ipaddr: {
            dns: ['0.0.0.0', '0.0.0.0'], // Set it to 0.0.0.0 to use default DNS of client
            wins: ['0.0.0.0', '0.0.0.0'], // Set it to 0.0.0.0 to use default client WINS
            dnsv6: ['::', '::'], // Set it to :: to let the client use default DNSv6 server
            winsv6: ['::', '::'], // Set it to :: to let the client use default WINSv6 server
            ippool: 'SSLVPN_TUNNEL_ADDR1', // Forti default ip pool
            ipv6pool: 'SSLVPN_TUNNEL_IPv6_ADDR1', // Forti default ip pool
        }
    });
});

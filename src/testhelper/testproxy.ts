import WebSocket, { createWebSocketStream } from "ws";

const allSocks: WebSocket[] = [];
const socks: {
    client: WebSocket[],
    test: WebSocket[],
} = {client: [], test: []};

async function pairTest() {
    if (socks.client.length > 0 && socks.test.length > 0) {
        const [ client ] = socks.client.slice(0, 1);
        const [ test ] = socks.test.slice(0, 1);
        client.on('message', (msg: Buffer) => {
            test.send(msg);
        });
        test.on('message', (msg: Buffer) => {
            client.send(msg);
        });
        client.on('end', () => {
            test.close();
        });
        client.send(JSON.stringify({
            jsonrpc: '2.0',
            method: 'serverInit',
            params: [],
        }));
        test.send(JSON.stringify({
            jsonrpc: '2.0',
            method: 'clientInit',
            params: [],
        }));
        //socks.client = socks.client.slice(1);
        socks.test = socks.test.splice(1);
        pairTest();
    }
}

let wss: WebSocket.Server | null = null;
export async function start(listenPort: number) {
    wss = new WebSocket.Server({ port: listenPort });
    wss.on('connection', async (ws: WebSocket) => {
        console.log('conneciton received!');
        allSocks.push(ws);
        ws.on('message', (msg: Buffer) => {
            const jsonMsg = JSON.parse(msg.toString('utf-8'));
            switch(jsonMsg.method) {
                case 'serverInit':
                    console.log('serverInit received!');
                    socks.test.push(ws);
                    break;
                case 'clientInit':
                    console.log('clientInit received!');
                    socks.client.push(ws);
                    break;
            }

            ws.removeAllListeners('message');
            pairTest();
        });
    });
}

export async function stop() {
    if (wss != null) {
        wss.close();
    }

    allSocks.forEach((elem) => {
        elem.close();
    });
}
import WebSocket, { createWebSocketStream } from "ws";

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
        test.on('end', () => {
            client.close();
        });
        socks.client = socks.client.slice(1);
        socks.test = socks.test.splice(1);
        pairTest();
    }
}

export async function testproxy(targetUrl: string, listenPort: number) {
    const wss = new WebSocket.Server({ port: listenPort });
    wss.on('connection', async (ws: WebSocket) => {
        ws.on('message', (msg: Buffer) => {
            const jsonMsg = JSON.parse(msg.toString('utf-8'));
            switch(jsonMsg.method) {
                case 'serverInit':
                    socks.test.push(ws);
                    break;
                case 'clientInit':
                    socks.client.push(ws);
                    break;
            }

            ws.removeAllListeners('message');
            pairTest();
        });
    });
}
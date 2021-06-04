import Parser, { Duplex, parser } from 'stream-json/Parser';
import WebSocket from 'ws';
import { RPCProvider, RPCv2Request, RPCv2Response } from './jsonrpcv2';

export class ConnectorServer {
    private stream: WebSocket;

    constructor(stream: WebSocket) {
        this.stream = stream;
        stream.on('data', console.log);

        this.stream.on('message', (msg: Buffer) => {
            const json = msg.toString('utf-8');
            const chunk = JSON.parse(json);
            console.log(chunk);
            if (chunk.jsonrpc != '2.0') {
                // Not a JSON-RPC v2 packet
                return;
            }

            if (chunk.method != null) {
                this.requestHandler(chunk);
            } else if (chunk.result != null) {
                this.responseHandler(chunk);
            }
        });
    }

    private requestHandler(chunk: RPCv2Request) {
        //
    }

    private responseHandler(chunk: RPCv2Response) {
        //
    }
}

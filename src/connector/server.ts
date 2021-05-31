import {Router} from 'express';
import { Duplex } from 'stream';
import {Parser, parser} from 'stream-json';

interface RPCv2Request {
    jsonrpc: '2.0',
    method: string,
    params: any[] | {[key: string]: any},
    id: number | undefined,
};

interface RPCv2Response {
    jsonrpc: '2.0',
    result: any | undefined,
    error: any | undefined,
    id: number,
};

export class ConnectorServer {
    private router: Router;
    private stream: Duplex;
    private streamingParser: Parser;

    constructor(stream: Duplex) {
        this.router = Router();
        this.stream = stream;
        this.streamingParser = parser();
        stream.pipe(this.streamingParser);

        this.streamingParser.on('data', (chunk: any) => {
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
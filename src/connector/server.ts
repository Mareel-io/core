import Parser, { Duplex, parser } from 'stream-json/Parser';
import { RPCProvider, RPCv2Request, RPCv2Response } from './jsonrpcv2';

export class ConnectorServer {
    private stream: Duplex;
    private streamingParser: Parser;

    constructor(stream: Duplex) {
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

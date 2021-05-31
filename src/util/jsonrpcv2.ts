import { Duplex } from 'stream';
import {Parser, parser} from 'stream-json';

export interface RPCv2Request {
    jsonrpc: '2.0',
    target?: string,
    class?: string,
    method: string,
    params: any[] | {[key: string]: any},
    id?: number
};

export interface RPCv2Response {
    jsonrpc: '2.0',
    result?: any,
    error?: any,
    id: number,
};

export class MethodNotAvailableError extends Error {
}

export class RPCProvider {
    private stream: Duplex;
    private streamingParser: Parser;
    private requestHandlers: ((req: RPCv2Request) => Promise<any>)[] = [];
    private callHandlerTable: {[key: number]: (res: any | null | undefined, err?: Error) => void} = {};
    private callId = 0;

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

    public async remoteCall(payload: RPCv2Request): Promise<any> {
        const curCallId = this.callId;
        this.callId += 1;
        if (this.callId < 0xFFFFFFFF) {
            this.callId = 0;
        }

        const ret: Promise<any> = new Promise((ful, rej) => {
            this.callHandlerTable[curCallId] = (res, err) => {
                if (err) {
                    rej(err);
                } else {
                    ful(res);
                }
            };
        });

        payload.id = curCallId;
        this.stream.write(JSON.stringify(payload));
        return ret;
    }

    protected remoteNotify(payload: RPCv2Request): void {
        delete payload.id;
        this.stream.write(JSON.stringify(payload));
    }

    private sendResponse(request: RPCv2Request, result: any, error?: Error) {
        if (error == null) {
            const response: RPCv2Response = {
                jsonrpc: '2.0',
                result: result,
                id: request.id!,
            };

            this.stream.write(JSON.stringify(response));
        } else {
            const response: RPCv2Response = {
                jsonrpc: '2.0',
                error: error.toString(),
                id: request.id!,
            };

            this.stream.write(JSON.stringify(response));
        }
    }

    private async requestHandler(chunk: RPCv2Request) {
        if (chunk.class === 'base') {
            // Some hardcoded essential methods
            switch (chunk.method) {
                case 'ping':
                    this.sendResponse(chunk, 'pong');
                    return;
            }
        }

        try {
            for(const handler of this.requestHandlers) {
                try {
                    const res = await handler(chunk);
                    this.sendResponse(chunk, res);
                } catch(e) {
                    if (e instanceof MethodNotAvailableError) {
                        // Eat up
                    } else {
                        throw e;
                    }
                }
            }

            this.sendResponse(chunk, null, new MethodNotAvailableError('Method not available'));
        } catch(e) {
            this.sendResponse(chunk, null, e);
        }
    }

    private responseHandler(chunk: RPCv2Response) {
        const handler = this.callHandlerTable[chunk.id];
        if (handler != null) {
            if (chunk.error != null) {
                handler(null, new Error(chunk.error));
            } else {
                handler(chunk.result);
            }
        }
    }

    public async addRequestHandler(cb: (req: RPCv2Request) => Promise<any>) {
        this.requestHandlers.push(cb);
    }

    public async removeRequestHandler(cb: (req: RPCv2Request) => Promise<any>) {
        const idx = this.requestHandlers.indexOf(cb);
        if (idx < 0) {
            return;
        }
        this.requestHandlers.splice(idx, 1);
    }
}
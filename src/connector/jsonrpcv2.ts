import { Duplex } from 'stream';
import {Parser, parser} from 'stream-json';
import WebSocket from 'ws';

export interface RPCv2Request {
    jsonrpc: '2.0',
    target?: string,
    class?: string,
    method: string,
    params: any[] | {[key: string]: any},
    id?: number
}

export interface RPCv2Response {
    jsonrpc: '2.0',
    result?: any,
    error?: any,
    id: number,
}

export interface RPCReturnType<T> {
    handled: boolean,
    result: T | null,
}

export class MethodNotAvailableError extends Error {
}

const debug = true;

export class RPCProvider {
    private stream: WebSocket;
    private requestHandlers: ((req: RPCv2Request) => Promise<RPCReturnType<any>>)[] = [];
    private notifyHandlers: ((req: RPCv2Request) => Promise<void>)[] = [];
    private callHandlerTable: {[key: number]: (res: any | null | undefined, err?: Error) => void} = {};
    private callId = 0;

    constructor(stream: WebSocket) {
        this.stream = stream;

        this.stream.on('message', (msg: Buffer) => {
            const json = msg.toString('utf-8');
            const chunk = JSON.parse(json);
            if (debug) { console.log('RECV'); console.log(chunk); }

            if (chunk.jsonrpc != '2.0') {
                // Not a JSON-RPC v2 packet
                return;
            }

            if (chunk.id == null) {
                this.notifyHandler(chunk);
            } else if (chunk.method != null) {
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
        if (debug) { console.log('SEND'); console.log(payload); }
        this.stream.send(JSON.stringify(payload));
        return ret;
    }

    public remoteNotify(payload: RPCv2Request): void {
        delete payload.id;
        if (debug) { console.log('SEND'); console.log(payload); }
        this.stream.send(JSON.stringify(payload));
    }

    private sendResponse(request: RPCv2Request, result: any, error?: Error) {
        if (error == null) {
            const response: RPCv2Response = {
                jsonrpc: '2.0',
                result: result,
                id: request.id!,
            };

            if (debug) { console.log('SEND'); console.log(response); }
            this.stream.send(JSON.stringify(response));
        } else {
            const response: RPCv2Response = {
                jsonrpc: '2.0',
                error: error.toString(),
                id: request.id!,
            };

            if (debug) { console.log('SEND'); console.log(response); }
            this.stream.send(JSON.stringify(response));
        }
    }

    private async notifyHandler(chunk: RPCv2Request) {
        for (const handler of this.notifyHandlers) {
            await handler(chunk);
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
                    const res = await (handler(chunk));
                    console.log('handler result');
                    console.log(res);
                    if (res.handled) {
                        this.sendResponse(chunk, res.result);
                        return;
                    }
                } catch(e) {
                    if (e instanceof MethodNotAvailableError) {
                        console.log(e);
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

    public async addRequestHandler(cb: (req: RPCv2Request) => Promise<RPCReturnType<any>>) {
        this.requestHandlers.push(cb);
    }

    public async removeRequestHandler(cb: (req: RPCv2Request) => Promise<RPCReturnType<any>>) {
        const idx = this.requestHandlers.indexOf(cb);
        if (idx < 0) {
            return;
        }
        this.requestHandlers.splice(idx, 1);
    }

    public async addNotifyHandler(cb: (req: RPCv2Request) => Promise<void>) {
        this.notifyHandlers.push(cb);
    }

    public async removeNotifyHandler(cb: (req: RPCv2Request) => Promise<void>) {
        const idx = this.notifyHandlers.indexOf(cb);
        if (idx < 0) {
            return;
        }
        this.notifyHandlers.splice(idx, 1);
    }
}
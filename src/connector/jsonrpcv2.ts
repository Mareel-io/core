import { Duplex, EventEmitter } from 'stream';
import {Parser, parser} from 'stream-json';
import WebSocket from 'ws';
import { MarilError, MarilRPCError, MarilRPCTimeoutError } from '../error/MarilError';
import { logger } from '../util/logger';

export interface RPCv2Request {
    jsonrpc: '2.0',
    target?: string,
    class?: string,
    method: string,
    params: unknown[] | {[key: string]: unknown},
    id?: number
}

export interface RPCv2Response {
    jsonrpc: '2.0',
    result?: unknown,
    error?: unknown,
    id: number,
}

export interface RPCReturnType<T> {
    handled: boolean,
    result: T | null,
}

export class MethodNotAvailableError extends Error {
}

export class RPCProvider extends EventEmitter {
    private stream: WebSocket;
    private requestHandlers: ((req: RPCv2Request) => Promise<RPCReturnType<unknown>>)[] = [];
    private notifyHandlers: ((req: RPCv2Request) => Promise<void>)[] = [];
    private callHandlerTable: {[key: number]: undefined | ((res: unknown | null | undefined, err?: Error) => void)} = {};
    private callId = 0;
    private defaultTimeout: number;

    constructor(stream: WebSocket, defaultTimeout = 30000) {
        super();
        this.stream = stream;
        this.defaultTimeout = defaultTimeout;

        this.replaceSocket(stream);
    }

    public replaceSocket(stream: WebSocket) {
        this.stream = stream;

        this.stream.on('message', (msg: Buffer) => {
            const json = msg.toString('utf-8');
            const chunk = JSON.parse(json);
            logger.debug('RECV');
            logger.debug(chunk);

            if (chunk.jsonrpc != '2.0') {
                // Not a JSON-RPC v2 packet
                return;
            }

            if (chunk.id == null) {
                this.notifyHandler(chunk);
            } else if (chunk.method !== undefined) {
                this.requestHandler(chunk);
            } else if (chunk.result !== undefined || chunk.error != undefined) {
                this.responseHandler(chunk);
            }
        });
    }

    public async remoteCall(payload: RPCv2Request, timeout?: number): Promise<unknown> {
        const curCallId = this.callId;
        this.callId += 1;
        if (this.callId > 0xFFFFFFFF) {
            this.callId = 0;
        }

        const ret: Promise<unknown> = new Promise((ful, rej) => {
            const timer = setTimeout(() => {
                this.callHandlerTable[curCallId] = undefined;
                rej(new MarilRPCTimeoutError('Timed out!'));
            }, timeout != null ? timeout : this.defaultTimeout);
            this.callHandlerTable[curCallId] = (res, err) => {
                clearTimeout(timer);
                this.callHandlerTable[curCallId] = undefined;
                if (err) {
                    rej(err);
                } else {
                    ful(res);
                }
            };
        });

        payload.id = curCallId;
        logger.debug('SEND');
        logger.debug(payload);
        this.stream.send(JSON.stringify(payload));
        return await ret;
    }

    public remoteNotify(payload: RPCv2Request): void {
        delete payload.id;
        logger.debug('SEND');
        logger.debug(payload);
        this.stream.send(JSON.stringify(payload));
    }

    private sendResponse(request: RPCv2Request, result: unknown, error?: Error): void {
        if (result === undefined) {
            result = null;
        }

        if (error == null) {
            const response: RPCv2Response = {
                jsonrpc: '2.0',
                result: result,
                id: request.id!,
            };

            logger.debug('SEND');
            logger.debug(response);
            this.stream.send(JSON.stringify(response));
        } else {
            const response: RPCv2Response = {
                jsonrpc: '2.0',
                error: {
                    message: error.message,
                    name: error.name,
                },
                id: request.id!,
            };

            logger.debug('SEND');
            logger.debug(response);
            this.stream.send(JSON.stringify(response));
        }
    }

    private async notifyHandler(chunk: RPCv2Request): Promise<void> {
        for (const handler of this.notifyHandlers) {
            await handler(chunk);
        }
    }

    private async requestHandler(chunk: RPCv2Request): Promise<void> {
        if (chunk.class === 'base') {
            // Some hardcoded essential methods
            switch (chunk.method) {
                case 'ping':
                    this.sendResponse(chunk, 'pong');
                    return;
                case 'error':
                    this.sendResponse(chunk, null, new MarilError('Test error'));
                    return;
            }
        }

        try {
            for(const handler of this.requestHandlers) {
                try {
                    const res = await (handler(chunk));
                    logger.debug('handler result');
                    logger.debug(res);
                    if (res.handled) {
                        this.sendResponse(chunk, res.result);
                        return;
                    }
                } catch(e) {
                    if (e instanceof MethodNotAvailableError) {
                        logger.debug(e);
                        // Eat up
                    } else {
                        throw e;
                    }
                }
            }

            this.sendResponse(chunk, null, new MethodNotAvailableError('Method not available'));
        } catch(e) {
            this.sendResponse(chunk, null, e as Error);
        }
    }

    private responseHandler(chunk: RPCv2Response): void {
        const handler = this.callHandlerTable[chunk.id];
        if (handler != null) {
            if (chunk.error != null) {
                if (typeof chunk.error === 'string') {
                    handler(null, new MarilRPCError(chunk.error));
                } else if (typeof chunk.error === 'object') {
                    const errorObj = chunk.error as {message: string, name?: string};
                    handler(null, new MarilRPCError(errorObj.message, errorObj.name));
                } else {
                    handler(null, new MarilRPCError(chunk.error + ''));
                }
            } else {
                handler(chunk.result);
            }
        }
    }

    public async addRequestHandler(cb: (req: RPCv2Request) => Promise<RPCReturnType<unknown>>) {
        this.requestHandlers.push(cb);
    }

    public async removeRequestHandler(cb: (req: RPCv2Request) => Promise<RPCReturnType<unknown>>) {
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

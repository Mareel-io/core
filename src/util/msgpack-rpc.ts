import msgpack, { DecodeStream } from 'msgpack-lite';
import { Socket } from 'net';
import { MarilRPCTimeoutError } from '../error/MarilError';
import { logger } from './logger';

export class MsgpackRPC {
    private port: number;
    private callId = 0;
    private msgpackDecodeStream: DecodeStream | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private rpcCbTable: {[key: number]: (msg: unknown, err: any) => void} = {};
    private socket: Socket | undefined;

    constructor(port: number) {
        this.port = port;
    }

    public async connect(timeout = 30000): Promise<void> {
        this.socket = new Socket();
        await new Promise((ful, rej) => {
            const timer = setTimeout(() => {
                rej(new MarilRPCTimeoutError('Timed out!'));
            }, timeout);

            this.socket?.connect(this.port, '127.0.0.1', () => {
                clearTimeout(timer);
                ful(null);
            });
        });
        this.socket.setNoDelay();
        this.msgpackDecodeStream = msgpack.createDecodeStream();
        this.socket.pipe(this.msgpackDecodeStream);

        return new Promise((ful, rej) => {
            const timer = setTimeout(() => {
                rej(new MarilRPCTimeoutError('Timed out!'));
            }, timeout);

            this.msgpackDecodeStream?.on('data', (msg: [number, number|string, unknown, unknown]) => {
                clearTimeout(timer);
                const msgArr: [number, number|string, unknown, unknown] = msg;
                const type = msgArr[0];
                const msgid = msgArr[1];
                const error = msgArr[2];
                const result = msgArr[3];

                if (type === 1) {
                    if (this.rpcCbTable[msgid as number] != null) {
                        const cb = this.rpcCbTable[msgid as number];
                        delete this.rpcCbTable[msgid as number];
                        cb(result, error);
                    }
                } if (type === 2) {
                    const msg = msgid as string;
                    if (msg === 'init') {
                        ful();
                    }
                }
            });
        });
    }

    protected getCallID(): number {
        if (this.callId >= 2147483647) {
            this.callId = 0;
        }

        this.callId += 1;
        return this.callId;
    }

    protected async runRPCCommand(method: string, ...params: unknown[]): Promise<any> {
        if (this.socket == null) {
            throw new Error('RPC not connected!');
        }
        logger.debug(`Calling ${method} through Msgpack-RPC`);
        logger.debug(`Payload: ${JSON.stringify(params)}`);

        const callId = this.getCallID();
        const cmd: [number, number, string, unknown[]] = [
            0,
            callId,
            method,
            params,
        ];

        const retprom = new Promise((ful, rej) => {
            const timeout = 30000;
            const timer = setTimeout(() => {
                rej(new MarilRPCTimeoutError('Timed out!'));
            }, timeout);
            this.rpcCbTable[callId] = (msg, err) => {
                clearTimeout(timer);
                if (err != null) {
                    rej(err);
                } else {
                    ful(msg);
                }
            }
        });

        this.socket.write(msgpack.encode(cmd));
        return retprom;
    }
}
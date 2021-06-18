import msgpack, { DecodeStream } from 'msgpack-lite';
import { Socket } from 'net';

export class MsgpackRPC {
    private port: number;
    private callId = 0;
    private msgpackDecodeStream: DecodeStream | null = null;
    private rpcCbTable: {[key: number]: (msg: unknown, err: any) => void} = {};
    private socket: Socket | undefined;

    constructor(port: number) {
        this.port = port;
    }

    public async connect(): Promise<void> {
        this.socket = new Socket();
        await new Promise((ful, _rej) => {
            this.socket?.connect(this.port, '127.0.0.1', () => {
                ful(null);
            });
        });
        this.socket.setNoDelay();
        this.msgpackDecodeStream = msgpack.createDecodeStream();
        this.socket.pipe(this.msgpackDecodeStream);

        return new Promise((ful, rej) => {
            this.msgpackDecodeStream?.on('data', (msg: [number, number|string, unknown, unknown]) => {
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
        })
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

        const callId = this.getCallID();
        const cmd: [number, number, string, unknown[]] = [
            0,
            callId,
            method,
            params,
        ];

        const retprom = new Promise((ful, rej) => {
            this.rpcCbTable[callId] = (msg, err) => {
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
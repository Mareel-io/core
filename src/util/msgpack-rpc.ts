import { spawn, ChildProcess } from 'child_process';
import msgpack from 'msgpack';
import hexy from 'hexy';
import { Socket } from 'net';

export class MsgpackRPC {
    private port: number;
    private callId = 0;
    private msgpackStream: any; // TODO: FIXME
    private rpcCbTable: {[key: number]: (msg: any, err: any) => void} = {};
    private socket: Socket | undefined;

    constructor(port: number) {
        this.port = port;
    }

    public async connect() {
        this.socket = new Socket();
        await new Promise((ful, _rej) => {
            this.socket?.connect(this.port, '127.0.0.1', () => {
                ful(null);
            });
        });
        this.socket.setNoDelay();
        this.msgpackStream = new (msgpack as any).Stream(this.socket);
        return new Promise((ful, rej) => {
            this.msgpackStream.on('msg', (msg: any) => {
                const msgArr: [number, number|string, any, any] = msg;
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
                        ful(null);
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

    protected async runRPCCommand(method: string, ...params: any[]): Promise<any> {
        if (this.socket == null) {
            throw new Error('RPC not connected!');
        }

        const callId = this.getCallID();
        const cmd: [number, number, string, any[]] = [
            0,
            callId,
            method,
            params,
        ];

        const packedMsg = msgpack.pack(cmd);
        const retprom = new Promise((ful, rej) => {
            this.rpcCbTable[callId] = (msg, err) => {
                if (err != null) {
                    rej(err);
                } else {
                    ful(msg);
                }
            }
        });

        this.socket?.write(packedMsg);
        return retprom;
    }
}
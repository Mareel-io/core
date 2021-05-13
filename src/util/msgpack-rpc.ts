import { spawn, ChildProcess } from 'child_process';
import msgpack from 'msgpack';

export class MsgpackRPC {
    private command: string;
    private args: string[] | undefined;
    private callId: number = 0;
    private childProc: ChildProcess | undefined;
    private msgpackStream: any; // TODO: FIXME
    private rpcCbTable: {[key: number]: (msg: any, err: any) => void} = {};

    constructor(command: string, args?: string[]) {
        this.command = command;
        this.args = args;
    }

    public start() {
        if (this.childProc != null) {
            return;
        }
        this.childProc = spawn(this.command, this.args);
        this.childProc.stderr?.pipe(process.stderr);
        this.msgpackStream = new (msgpack as any).Stream(this.childProc.stdout);
        this.msgpackStream.on('msg', (msg: any) => {
            const msgArr: [number, number, any, any] = msg;
            const type = msgArr[0];
            const msgid = msgArr[1];
            const error = msgArr[2];
            const result = msgArr[3];

            if (type == 2) {
                if (this.rpcCbTable[msgid] != null) {
                    const cb = this.rpcCbTable[msgid];
                    delete this.rpcCbTable[msgid];
                    cb(result, error);
                }
            }
        });
    }

    public stop() {
        if (this.childProc == null) {
            return;
        }
        this.childProc.kill();
    }

    protected getCallID(): number {
        if (this.callId >= 2147483647) {
            this.callId = 0;
        }

        this.callId += 1;
        return this.callId;
    }

    protected async runRPCCommand(method: string, ...params: any[]): Promise<any> {
        if (this.childProc == null) {
            throw new Error('Childprocess is not started!');
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

        this.childProc.stdin?.write(packedMsg);
        return retprom;
    }
}
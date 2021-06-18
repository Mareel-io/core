import { spawn, ChildProcess } from 'child_process';

export class SvcRunner {
    private command: string;
    private args: string[] | undefined;
    private childProc: ChildProcess | undefined;

    constructor(command: string, args?: string[]) {
        this.command = command;
        this.args = args;
    }

    public async start(): Promise<void> {
        if (this.childProc != null) {
            return;
        }

        this.childProc = spawn(this.command, this.args, {
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        return new Promise((ful, rej) => {
            // Wait for initialization message
            this.childProc?.stdout?.on('data', (data) => {
                ful();
            });
        }) as Promise<void>;
    }

    public async stop(): Promise<void> {
        if (this.childProc == null) {
            return
        }

        this.childProc.kill();
        this.childProc = undefined;
    }
}
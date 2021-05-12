import { NodeSSH } from 'node-ssh';
import { ThisConverter } from 'typedoc/dist/lib/converter/types';

export interface SSHCred {
    user: string,
    password?: string, // TODO: FIXME
}

export interface SSHOpts {
    algorithms?: {
        kex?: string[], // TODO: Fixme
    },
}

class CiscoSSHStreamWrapper {
    stream: NodeJS.ReadWriteStream;

    constructor(stream: NodeJS.ReadWriteStream) {
        this.stream = stream;
    }

    // TODO: Implement proper locking
    async runCommand(cmd: string): Promise<string> {
        this.stream.read(); // Discard the stream
        this.stream.write(`${cmd}\n`);
        return new Promise((ful, rej) => {
            let buf = '';
            this.stream.on('data', (data) => {
                if (data[0] == 0x1b) return;
                try {
                    if (data.toString('utf-8').match(/^[a-zA-Z0-9]*#$/)) {
                        this.stream.removeAllListeners('data');
                        ful(buf);
                    } else {
                        buf += data.toString('utf-8');
                    }
                } catch(e) {
                    // Eat up
                }
            });

            this.stream.on('error', (e) => {
                rej(e);
            });
        });
    }
}

export class CiscoSSHClient {
    private sshclient: NodeSSH;
    private host: string;
    private port: number;
    private credential: SSHCred;
    private sshopts: SSHOpts;
    private sshStream: NodeJS.ReadWriteStream | undefined;
    private sshStreamWrapper: CiscoSSHStreamWrapper | undefined;

    constructor(host: string, port: number, credential: SSHCred, sshopts: SSHOpts) {
        this.sshclient = new NodeSSH();
        this.host = host;
        this.port = port;
        this.credential = credential;
        this.sshopts = sshopts;
    }

    public async connect(): Promise<void> {
        await this.sshclient.connect({
            host: this.host,
            port: this.port,
            username: this.credential.user,
            password: this.credential.password,
            ...this.sshopts,
        });

        this.sshStream = await this.sshclient.requestShell()
        this.sshStreamWrapper = new CiscoSSHStreamWrapper(this.sshStream!);
        this.sshStream?.on('close', () => {
            this.sshStream = undefined;
            this.sshStreamWrapper = undefined;
        });
    }

    public async runCiscoCommand(command: string): Promise<string> {
        if (this.sshStreamWrapper == undefined) {
            await this.connect();
        }

        return await this.sshStreamWrapper!.runCommand(command);
    }
}
import { CiscoSSHClient } from "../../../util/ssh";
import { CiscoTFTPServer } from "../../../util/tftp";
import { v4 as uuidv4 } from 'uuid';

export class CiscoTFTPUtil {
    private ssh: CiscoSSHClient;
    private tftpServer: CiscoTFTPServer;

    constructor(ssh: CiscoSSHClient, tftpServer: CiscoTFTPServer) {
        this.ssh = ssh;
        this.tftpServer = tftpServer;
    }

    private async waitForFile(filename: string): Promise<Buffer> {
        let buf = Buffer.from([]);
        return new Promise((ful, rej) => {
            this.tftpServer.reserveFileToRecv(filename, (stream) => {
                stream.on('abort', (e) => rej(e));
                stream.on('error', (e) => rej(e));
                stream.on('data', (data) => {
                    buf = Buffer.concat([buf, data]);
                });
                stream.on('end', () => {
                    ful(buf);
                });
            });
        }) as Promise<Buffer>;
    }

    public async putFile(path: string, data: Buffer): Promise<void> {
        const filename = `${uuidv4()}`;
        this.tftpServer.addFileToServe(filename, data);
        const tftpURL: string = this.tftpServer.getCiscoTFTPURL(filename);
        await this.ssh.connect();
        try {
            await this.ssh.runCiscoCommand(`copy ${tftpURL} ${path}`);
        } finally {
            await this.ssh.disconnect();
        }
    }

    public async fetchFile(path: string, type?: string): Promise<Buffer> {
        const filename = `${uuidv4()}`;
        await this.ssh.connect();
        const retprom: Promise<Buffer> = this.waitForFile(filename);
        const tftpURL: string = this.tftpServer.getCiscoTFTPURL(filename);
        try {
            let cmd = 'copy ';
            if (type != null) {
                cmd += `${type} `;
            }
            cmd += `${path} ${tftpURL}`;
            await this.ssh.runCiscoCommand(cmd);
            return await retprom;
        } finally {
            await this.ssh.disconnect();
        }
    }
}
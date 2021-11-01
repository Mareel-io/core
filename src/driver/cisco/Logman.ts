import { InvalidParameterError, UnsupportedFeatureError } from "../../error/MarilError";
import { SNMPClient } from "../../util/snmp/snmp";
import { CiscoSSHClient } from "../../util/ssh";
import { CiscoTFTPServer } from "../../util/tftp";
import { LogEntry, Logman as GenericLogman } from "../generic/Logman";
import { CiscoTFTPUtil } from "./util/TFTPUtil";

export class Logman extends GenericLogman {
    private snmp: SNMPClient;
    private ssh: CiscoSSHClient;
    private tftpServer: CiscoTFTPServer;
    private tftpUtil: CiscoTFTPUtil;

    constructor(snmp: SNMPClient, ssh: CiscoSSHClient, tftpServer: CiscoTFTPServer) {
        super();
        this.snmp = snmp;
        this.ssh = ssh;
        this.tftpServer = tftpServer;
        this.tftpUtil = new CiscoTFTPUtil(this.ssh, this.tftpServer);
    }

    /**
     * Fetch Cisco log stored in flash memory
     * 
     * @returns Log entries
     */
    private async getFlashLog(): Promise<string[]> {
        const file = await this.tftpUtil.fetchFile('flash://system/syslog/logging');
        return file.toString('utf-8').split('\n');
    }

    /**
     * Fetch Cisco log stored in RAM
     * 
     * @returns Log entries
     */
    private async getRAMLog(): Promise<string[]> {
        const file = await this.tftpUtil.fetchFile('logging');
        return file.toString('utf-8').split('\n');
    }

    public async getAvailableSources(): Promise<string[]> {
        return ['flash', 'ram'];
    }

    /**
     * Fetch log from Cisco device
     * 
     * @param source Log source. Can be flash or ram
     * @param from Date from
     * @param to Date to
     * @returns Log entries
     */
    public async queryLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]> {
        switch (source) {
            case 'flash':
                return (await this.getFlashLog()).map((elem) => {
                    // TODO: Implement me.
                    return new LogEntry(new Date('1970-01-01T00:00:00Z'), elem);
                });
            case 'ram':
                return (await this.getRAMLog()).map((elem) => {
                    // TODO: Implement me.
                    return new LogEntry(new Date('1970-01-01T00:00:00Z'), elem);
                });
            default:
                throw new InvalidParameterError(`Log storage ${source} is not supported.`);
        }
    }
}

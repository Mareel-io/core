import { CiscoSSHClient } from "../../../util/ssh";
import { CiscoTFTPServer } from "../../../util/tftp";
import { CiscoConfigEditor } from "../configedit/configeditor";
import { CiscoTFTPUtil } from "./TFTPUtil";

export class CiscoConfigUtil {
    private ssh: CiscoSSHClient;
    private configedit: CiscoConfigEditor;
    private tftpServer: CiscoTFTPServer;
    private tftpUtil: CiscoTFTPUtil;

    constructor(configEditorPort: number, ssh: CiscoSSHClient, tftpServer: CiscoTFTPServer) {
        this.ssh = ssh;
        this.tftpServer = tftpServer;
        this.configedit = new CiscoConfigEditor(configEditorPort);
        this.tftpUtil = new CiscoTFTPUtil(this.ssh, this.tftpServer);
    }

    /**
     * Initialize Cisco switch configurator.
     */
    public async init(): Promise<void> {
        await this.configedit.connect();
    }

    /**
     * Download & load config using TFTP & SSH
     */
    public async loadConfig(): Promise<void> {
        const configFile = await this.tftpUtil.fetchFile('running-config')
        const config = configFile.toString('utf-8');
        await this.configedit.loadCfg(config);
        console.log('config loaded.');
    }

    /**
     * Upload config to device using TFTP & ssh.
     */
    public async applyConfig(): Promise<void> {
        const configFile = Buffer.from(await this.configedit.extractCfg());
        await this.tftpUtil.putFile('running-config', configFile);
        console.log('Configuration uploaded to device.');
    }
   
    /**
     * Current config file in text format. For debugging/backup purpose
     * @returns Config file
     */
    public async extractCfg(): Promise<string> {
        return await this.configedit.extractCfg();
    }

    public get configEditor(): CiscoConfigEditor {
        return this.configedit;
    }
}

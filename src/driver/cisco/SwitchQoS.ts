import { CiscoTFTPServer } from '../../util/tftp';
import { SNMPClient } from '../../util/snmp/snmp';
import { CiscoSSHClient } from '../../util/ssh';
import {CoSMap, DSCPMap, SwitchQoS as GenericSwitchQoS} from '../generic/SwitchQoS';
import { CiscoConfigUtil } from './util/ConfigUtil';

export class SwitchQoS extends GenericSwitchQoS {
    private snmp: SNMPClient;
    private configUtil: CiscoConfigUtil;
    private portList: number[] = [];

    constructor(snmp: SNMPClient, ssh: CiscoSSHClient, tftpServer: CiscoTFTPServer) {
        super();
        this.snmp = snmp;
        this.configUtil = new CiscoConfigUtil(1337, ssh, tftpServer);
    }

    /**
     * Initialize Cisco switch configurator.
     */
    public async init(): Promise<void> {
        await this.configUtil.init();
    }

    /**
     * Download & load config using TFTP & SSH
     */
    public async loadConfig(): Promise<void> {
        await this.configUtil.loadConfig();
    }

    /**
     * Upload config to device using TFTP & ssh.
     */
    public async applyConfig(): Promise<void> {
        await this.configUtil.applyConfig();
    }
   
    /**
     * Current config file in text format. For debugging/backup purpose
     * @returns Config file
     */
    public async extractCfg(): Promise<string> {
        return await this.configUtil.extractCfg();
    }

    public async setQueuePriority(wrr: number[]): Promise<void> {
        await this.configUtil.configEditor.setQueuePriority(wrr);
    }

    public async setStrictPriorityQ(idx: number): Promise<void> {
        await this.configUtil.configEditor.setStrictPriorityQ(idx);
    }

    public async getQueuePriority(): Promise<number[]> {
        return await this.configUtil.configEditor.getQueuePriority();
    }

    public async getStrictPriorityQ(): Promise<number> {
        return await this.configUtil.configEditor.getStrictPriorityQ();
    }

    public async setDSCPMap(map: DSCPMap): Promise<void> {
        await this.configUtil.configEditor.setDSCPMap(map);
    }

    public async setCoSMap(map: CoSMap): Promise<void> {
        await this.configUtil.configEditor.setCoSMap(map);
    }

    public async getDSCPMap(): Promise<DSCPMap> {
        return await this.configUtil.configEditor.getDSCPMap();
    }

    public async getCoSMap(): Promise<CoSMap> {
        return await this.configUtil.configEditor.getCoSMap();
    }
}

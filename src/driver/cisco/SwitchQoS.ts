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

    public setQueuePriority(wrr: number[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public setStrictPriorityQ(idx: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public getQueuePriority(): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    public getStrictPriorityQ(): Promise<number> {
        throw new Error('Method not implemented.');
    }

    public setDSCPMap(map: DSCPMap): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public setCoSMap(map: CoSMap): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public getDSCPMap(): Promise<DSCPMap> {
        throw new Error('Method not implemented.');
    }

    public getCoSMap(): Promise<CoSMap> {
        throw new Error('Method not implemented.');
    }
}

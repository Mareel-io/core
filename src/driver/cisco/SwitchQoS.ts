import { CiscoTFTPServer } from '../../util/tftp';
import { SNMPClient } from '../../util/snmp/snmp';
import { CiscoSSHClient } from '../../util/ssh';
import {CoSMap, DSCPMap, SwitchQoS as GenericSwitchQoS} from '../generic/SwitchQoS';
import { CiscoConfigEditor } from './configedit/configeditor';
import { CiscoTFTPUtil } from './util/TFTPUtil';

export class SwitchQoS extends GenericSwitchQoS {
    private snmp: SNMPClient;
    private ssh: CiscoSSHClient;
    private configedit: CiscoConfigEditor;
    private tftpServer: CiscoTFTPServer;
    private tftpUtil: CiscoTFTPUtil;
    private portList: number[] = [];

    constructor(snmp: SNMPClient, ssh: CiscoSSHClient, tftpServer: CiscoTFTPServer) {
        super();
        this.snmp = snmp;
        this.ssh = ssh;
        this.tftpServer = tftpServer;
        this.configedit = new CiscoConfigEditor(1337);
        this.tftpUtil = new CiscoTFTPUtil(this.ssh, this.tftpServer);
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

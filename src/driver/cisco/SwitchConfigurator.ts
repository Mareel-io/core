import { SNMPClient } from '../../util/snmp/snmp';
import { EthernetPort } from './EthernetPort';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../generic/SwitchConfigurator';
import { VLAN } from '../generic/VLAN';
import { CiscoSSHClient } from '../../util/ssh';
import { CiscoConfigEditor } from './configedit/configeditor';
import { CiscoTFTPServer } from '../../util/tftp';
import { v4 as uuidv4 } from 'uuid';

// Possible OID table
// iso(1) identified-organization(3) dod(6) internet(1) private(4) enterprise(1) cisco(9) ciscoMgmt(9) ciscoCdpMIB(23)
// cdpInterfaceGroup
// 1.3.6.1.4.1.9.9.23.1.1.1.1.4
// cdpInterfacePort
// 1.3.6.1.4.1.9.9.23.1.1.1.1.6
// cdpInterfaceExtTable
//

interface IFProperties {
    description: string,
    mtu: number,
    speed: number,
    physAddr: string,
    allowAdm: number,
    enabled: number,
    inOctets: number,
    inError: number,
    outOctets: number,
    outError: number,
};

export class SwitchConfigurator extends GenericSwitchConfigurator {
    private snmp: SNMPClient;
    private ssh: CiscoSSHClient;
    private configedit: CiscoConfigEditor;
    private tftpServer: CiscoTFTPServer;
    private systemIPv4: string;

    constructor(snmp: SNMPClient, ssh: CiscoSSHClient, tftpServer: CiscoTFTPServer, systemIPv4: string) {
        super();
        this.snmp = snmp;
        this.ssh = ssh;
        this.tftpServer = tftpServer;
        this.configedit = new CiscoConfigEditor(1337);
        this.systemIPv4 = systemIPv4;
    }

    public async init() {
        await this.configedit.connect();
    }
   
    private async fetchConfigFile(): Promise<string> {
        await this.ssh.connect();
        const filename = `${uuidv4()}.cfg`;
        const retprom: Promise<string> = new Promise((ful, rej) => {
            let buf = Buffer.from([]);
            this.tftpServer.reserveFileToRecv(filename, (stream) => {
                stream.on('abort', (e) => rej(e));
                stream.on('error', (e) => rej(e));
                stream.on('data', (data) => {
                    buf = Buffer.concat([buf, data]);
                });
                stream.on('end', () => {
                    ful(buf.toString('utf-8'));
                });
            });
        });
        const foo = await this.ssh.runCiscoCommand(`copy running-config tftp://${this.systemIPv4}/${filename}`);
        this.ssh.disconnect();
        return retprom;
    }

    private async putConfigFile(config: string): Promise<void> {
        await this.ssh.connect();
        const filename = `${uuidv4()}.cfg`;
        this.tftpServer.addFileToServe(filename, Buffer.from(config));
        await this.ssh.runCiscoCommand(`copy tftp://${this.systemIPv4}/${filename} running-config`);
        this.ssh.disconnect();
    }

    private convertHWAddr(rawaddr: Buffer) {
        return rawaddr.reduce((acc: string, val): string => {
            let digit = val.toString(16).toLowerCase();
            if (digit.length === 1) {
                digit = '0' + digit;
            }
            return `${acc}:${digit}`;
        }, '').substr(1);
    }

    private async getIFNames(): Promise<{[key: number]: string}> {
        const resps = await this.snmp.subtree('1.3.6.1.2.1.31.1.1.1.1', 100);
        const ifs: {[key: number]: string} = {};

        resps.forEach((elem, i) => {
            const splittedOID = elem.oid.split('.');
            const ifidx = parseInt(splittedOID[splittedOID.length - 1], 10);

            ifs[ifidx] = elem.value.toString();
        });

        return ifs;
    }

    private async getIFVlanMembership(): Promise<{[tag: number]: string[]}> {
        //const ret: {[key: string]: bitmasks} = [];
        //// Walk through rldot1qVlanMaembershipTypeTable.rldot1qVlanMembershipTypeEntry
        //const vlanMembershipType = await this.snmp.subtree('1.3.6.1.4.1.9.6.1.101.48.72.1', 100);
        //vlanMembershipType.forEach((elem, idx) => {
        //    console.log(elem);
        //});
        //const vlanStaticName = await this.snmp.subtree('1.3.6.1.4.1.9.6.1.101.48.72.1', 100);
        //vlanStaticName.forEach((elem, idx) => {
        //    console.log(elem);
        //});
        return {};
    }

    private async getVlanPortModeTable(): Promise<void> {
        const portModes = await this.snmp.subtree('1.3.6.1.4.1.9.6.1.101.48.22.1.1', 100);
        //
    }

    private async getIFProperties(): Promise<{[key: number]: IFProperties}> {
        const resps = await this.snmp.subtree('1.3.6.1.2.1.2', 100);
        console.log(resps);

        const ret: {[key: number]: IFProperties} = {};

        resps.forEach((elem, i) => {
            const splittedOID = elem.oid.split('.');
            const splittedIRI = elem.oidIRI.split('/');
            const ifidx = parseInt(splittedOID[splittedOID.length - 1], 10);
            const propSubOID = parseInt(splittedOID[splittedOID.length - 2], 10);
            const propSub = splittedIRI[splittedOID.length - 1];

            if (elem.oid === '1.3.6.1.2.1.2.1.0') {
                // IFace cnt
            } else if (elem.oid.startsWith('1.3.6.1.2.1.2.2.1.') == true) {
                if (ret[ifidx] == null) {
                    ret[ifidx] = {} as IFProperties;
                }

                switch(propSubOID) {
                    case 1:
                        // ifIndex
                        break;
                    case 2:
                        // ifDescr
                        ret[ifidx].description = (elem.value as Buffer).toString('utf-8');
                        break;
                    case 3:
                        // ifType
                        //console.log(elem.value);
                        break;
                    case 4:
                        // ifMtu
                        ret[ifidx].mtu = elem.value as number;
                        break;
                    case 5:
                        // ifSpeed
                        ret[ifidx].speed = elem.value as number;
                        break;
                    case 6:
                        // ifPhysAddress
                        ret[ifidx].physAddr = this.convertHWAddr(elem.value as Buffer);
                        break;
                    case 7:
                        // ifAdminStatus
                        ret[ifidx].allowAdm = elem.value as number;
                        break;
                    case 8:
                        // ifOperStatus
                        ret[ifidx].enabled = elem.value as number;
                        break;
                    case 9:
                        // ifLastChange
                        console.log(elem.value);
                        break;
                    case 10:
                        // ifInOctets
                        ret[ifidx].inOctets = elem.value as number;
                        break;
                    case 11:
                        // ifInUcastPkts
                        break;
                    case 12:
                        // ifInNUcastPkts
                        break;
                    case 13:
                        // ifInDiscards
                        break;
                    case 14:
                        // ifInErrors
                        ret[ifidx].inError = elem.value as number;
                        break;
                    case 15:
                        // ifInUnknownProtos
                        break;
                    case 16:
                        // ifOutOctets
                        ret[ifidx].outOctets = elem.value as number;
                        break;
                    case 17:
                        // ifOutUcastPkts
                        break;
                    case 18:
                        // ifOutNUcastPkts
                        break;
                    case 19:
                        // ifOutDiscards
                        break;
                    case 20:
                        // ifOutErrors
                        ret[ifidx].outError = elem.value as number;
                        break;
                    case 22:
                        // ifSpecific
                        break;
                    default:
                        console.log(`${propSubOID} => ${propSub}`);
                }
            } else {
                throw new Error(`Error: Unknown OID ${elem.oid}, ${elem.oidIRI}`);
            }

        })
        return ret;
    }

    public async loadConfig() {
        await this.configedit.ping();
        console.log('It works');
        return ;
        const config = await this.fetchConfigFile();

        console.log('config loaded.');
        await this.configedit.loadCfg(config);
        console.log('config.parsed')
        console.log(await this.configedit.extractCfg());
    }

    public async getVLANEntries() {
        // TODO: Run RPC
    }

    public async getSwitchPorts(): Promise<EthernetPort[]> {
        const ret: EthernetPort[] = [];
        const ifnames = await this.getIFNames();
        const ifproperties = await this.getIFProperties();

        for(let i = 0; i < Object.keys(ifnames).length; i++) {
            const k = Object.keys(ifnames)[i] as unknown as number;
            ret[i] = new EthernetPort();
            ret[i].portName = ifnames[k];
            ret[i].isActive = ifproperties[k].enabled == 1 ? true : false;
            ret[i].linkSpeed = `${ifproperties[k].speed}Mbps`;
            ret[i].autoneg = true; // TODO: FIXME
            ret[i].tag = 0; // TODO: FIXME
        }
        return ret;
    }
    public setSwitchPort(port: EthernetPort, portIdx: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public async getAllVLAN(): Promise<VLAN[]> {
        return [];
    }
    public getVLAN(vid: number): Promise<VLAN> {
        throw new Error('Method not implemented.');
    }
    public setVLAN(vlan: VLAN): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
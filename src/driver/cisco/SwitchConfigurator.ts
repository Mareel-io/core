import { SNMPClient } from '../../util/snmp/snmp';
import { EthernetPort } from './EthernetPort';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../generic/SwitchConfigurator';
import { VLAN } from './VLAN';
import { CiscoSSHClient } from '../../util/ssh';
import { CiscoConfigEditor, CiscoPort } from './configedit/configeditor';
import { CiscoTFTPServer } from '../../util/tftp';
import { v4 as uuidv4 } from 'uuid';
import { CiscoTFTPUtil } from './util/TFTPUtil';
import { MarilError, ResourceNotAvailableError } from '../../error/MarilError';
import { MethodNotAvailableError } from '../../connector/jsonrpcv2';

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
}

/**
 * Cisco switch configurator
 */
export class SwitchConfigurator extends GenericSwitchConfigurator {
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

        // FIXME: hardcoded 24-port switch
        for(let i = 1; i <= 24; i++) {
            this.portList.push(i);
        }
    }

    /**
     * Initialize Cisco switch configurator.
     */
    public async init(): Promise<void> {
        await this.configedit.connect();
    }

    /**
     * Convert SNMP mac address to canonical form.
     * @param rawaddr MAC address in binary format, can be retrieved from SNMP
     * @returns 
     */
    private convertHWAddr(rawaddr: Buffer): string {
        return rawaddr.reduce((acc: string, val): string => {
            let digit = val.toString(16).toLowerCase();
            if (digit.length === 1) {
                digit = '0' + digit;
            }
            return `${acc}:${digit}`;
        }, '').substr(1);
    }

    /**
     * fetch interface names using SNMP, work in progress.
     * @returns Interface number & name mapping table
     */
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

    /**
     * Fetch interface properties using SNMP, work in progress.
     * @returns Interface properties
     */
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
                throw new MarilError(`Error: Unknown OID ${elem.oid}, ${elem.oidIRI}`);
            }

        })
        return ret;
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

    /**
     * Fetch switch ports using SNMP. work in progress.
     * @returns Ethernet ports
     */
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

    /**
     * Set Switch port configuration. Work in progress
     * @param port Ethernet port object
     * @param portIdx Port index
     */
    public setSwitchPort(port: EthernetPort, portIdx: number): Promise<void> {
        throw new MethodNotAvailableError();
    }

    /**
     * Parse and extract VLAN configuration from config file
     * @returns All VLAN entry
     */
    public async getAllVLAN(): Promise<VLAN[]> {
        const vlanRange = await this.configedit.getVLANRange();
        const vlanEntries = await this.configedit.getVLANs();
        const ports = await this.configedit.getPorts();
        const vlans: VLAN[] = [];
        const vlanMap: {[key: number]: VLAN} = {};

        const vlanAliasMap: {[key: number]: string | undefined} = {};

        for(const vlanEnt of vlanEntries) {
            vlanAliasMap[vlanEnt.tagNo] = vlanEnt.name;
        }

        for(const vid of vlanRange) {
            console.log(vid)
            const vlanEnt = new VLAN('802.1q');
            vlanEnt.vid = vid;
            if(vlanAliasMap[vid] != null) {
                vlanEnt.alias = vlanAliasMap[vid] as string;
            }
            vlans.push(vlanEnt);
            vlanMap[vid] = vlanEnt;
        }

        const portNumbers = [];

        for(const port of ports) {
            portNumbers.push(port.portNo);
            const iface = new EthernetPort();
            iface.portName = `GE${port.portNo}`;

            if(port.pvid == null) {
                // pvid = 1
                vlanMap[1].addPortMember(iface, 'PU');
            } else {
                if (vlanMap[port.pvid] != null) {
                    vlanMap[port.pvid].addPortMember(iface, 'PU');
                }
            }

            for(const allowedEnt of (port.allowedList || [])) {
                if (allowedEnt != port.pvid) {
                    if(vlanMap[allowedEnt] != null) {
                        vlanMap[allowedEnt].addPortMember(iface, 'T');
                    }
                } else {
                    if(vlanMap[allowedEnt] != null) {
                        vlanMap[allowedEnt].addPortMember(iface, 'U');
                    }
                }
            }

            for(const taggedEnt of (port.taggedList || [])) {
                // TODO: ImplementMe
            }
        }

        for(const port of this.portList) {
            if (portNumbers.indexOf(port) == -1) {
                const iface = new EthernetPort();
                iface.portName = `GE${port}`;
                vlanMap[1].addPortMember(iface, 'PU');
            }
        }
        return vlans;
    }

    /**
     * Fetch specific VLAN
     * @param vid VLAN ID
     * @returns VLAN, if VLAN is not found, return null
     */
    public async getVLAN(vid: number): Promise<VLAN | null> {
        const vlans = await this.getAllVLAN();
        const validVlan = vlans.filter((vlan) => {
            return vlan.vid == vid
        });

        if (validVlan.length == 0) {
            return null;
        } else {
            return validVlan[0];
        }
    }

    /**
     * Apply VLAN configuration to config file, unlike ipTIME, this method
     * does not commit configuration to device directly.
     * @param vlan VLAN object
     */
    public async setVLAN(vlan: VLAN): Promise<void> {
        const ports = vlan.getPortList();
        const configPorts = await this.configedit.getPorts();
        const portMap: {[key: number]: CiscoPort} = {};

        for(const cfgPort of configPorts){
            portMap[cfgPort.portNo] = cfgPort;
        }

        for(const port of ports) {
            const match = port.port.portName.match(/^[A-Z]*([0-9]+)$/);
            if (match == null) {
                throw new ResourceNotAvailableError('Invalid portname: Not in GE[0-9]* format');
            }

            const portNo = parseInt(match[1], 10);

            if(portMap[portNo] == null) {
                portMap[portNo] = {
                    portNo: portNo,
                    pvid: 1,
                };
            }

            const cfgPort = portMap[portNo];
            if ((cfgPort.allowedList || []).indexOf(vlan.vid) == -1) {
                if (cfgPort.allowedList == null) {
                    cfgPort.allowedList = []
                }

                cfgPort.allowedList.push(vlan.vid)
            }

            if ((port.tag == 'T' || port.tag == 'PT') && (cfgPort.taggedList || []).indexOf(vlan.vid) == -1) {
                if (cfgPort.taggedList == null) {
                    cfgPort.taggedList = []
                }

                cfgPort.taggedList.push(vlan.vid)
            }

            this.configedit.setPortVLAN(cfgPort.portNo, cfgPort.pvid, cfgPort.taggedList, cfgPort.allowedList);
        }
    }
}

import { SNMPClient } from '../../util/snmp/snmp';
import { EthernetPort } from '../generic/EthernetPort';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../generic/SwitchConfigurator';
import { VLAN } from '../generic/VLAN';

// Possible OID table
// iso(1) identified-organization(3) dod(6) internet(1) private(4) enterprise(1) cisco(9) ciscoMgmt(9) ciscoCdpMIB(23)
// cdpInterfaceGroup
// 1.3.6.1.4.1.9.9.23.1.1.1.1.4
// cdpInterfacePort
// 1.3.6.1.4.1.9.9.23.1.1.1.1.6
// cdpInterfaceExtTable
//

interface IFProperties {
    //
};

export class SwitchConfigurator extends GenericSwitchConfigurator {
    private snmp: SNMPClient;
    constructor(snmp: SNMPClient) {
        super();
        this.snmp = snmp;
    }

    private async getIFNames(): Promise<{[key: number]: string}> {
        const resps = await this.snmp.walk('1.3.6.1.2.1.31.1.1.1.1', 10);
        const ifs: {[key: number]: string} = {};

        for (let i = 0; i < length; i++) {
            const elem = resps[i];
            const ifidx = elem.oidArr[elem.oidArr.length - 1];

            ifs[ifidx] = elem.value as string;
        }

        return ifs;
    }

    private async getIFProperties(): Promise<{[key: number]: IFProperties> {
        const resps = await this.snmp.walk('1.3.6.1.2.1.2', 10);

        for (let i = 0; i < length; i++) {
            //
        }
        return {};
    }

    public getSwitchPorts(): Promise<EthernetPort[]> {
        throw new Error('Method not implemented.');
    }
    public setSwitchPort(port: EthernetPort, portIdx: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public getAllVLAN(): Promise<VLAN[]> {
        throw new Error('Method not implemented.');
    }
    public getVLAN(vid: number): Promise<VLAN> {
        throw new Error('Method not implemented.');
    }
    public setVLAN(vlan: VLAN): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
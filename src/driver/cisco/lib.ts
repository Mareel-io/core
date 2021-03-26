import { MIBLoader } from '../../util/snmp/mibloader';
import { SNMPClient, SNMPClientConfig } from '../../util/snmp/snmp';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { SwitchConfigurator as CiscoSwitchConfigurator } from './SwitchConfigurator';

export class ControllerFactory extends GenericControllerFactory {
    private snmp: SNMPClient | null = null;
    private mibFile: string;
    constructor(deviceaddress: string, mibFile: string) {
        super(deviceaddress);

        this.mibFile = mibFile;
    }

    public async authenticate(credential: SNMPClientConfig) {
        const mibLoader = new MIBLoader(this.mibFile);
        await mibLoader.init();
        this.snmp = new SNMPClient(this.deviceaddress, credential, mibLoader);
        await this.snmp.connect();
    }

    public getSwitchConfigurator(): CiscoSwitchConfigurator {
        if (this.snmp == null) {
            throw new Error('Not authenticated.');
        }
        return new CiscoSwitchConfigurator(this.snmp);
    }
}
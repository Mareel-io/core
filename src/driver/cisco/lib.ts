import { MIBLoader } from '../../util/snmp/mibloader';
import { SNMPClient, SNMPClientConfig } from '../../util/snmp/snmp';
import { CiscoSSHClient, SSHCredential } from '../../util/ssh';
import { CiscoTFTPServer } from '../../util/tftp';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { SwitchConfigurator as CiscoSwitchConfigurator } from './SwitchConfigurator';
import { SvcRunner } from '../../util/svcrunner';
import path from 'path';
import { NetTester } from '../efm/monitor/NetTester';
import { FirewallConfigurator } from '../generic/FirewallConfigurator';
import { Logman } from './Logman';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { AuthError, MethodNotImplementedError } from '../../error/MarilError';
import { SwitchQoS as CiscoSwitchQoS } from './SwitchQoS';
import { RouteConfigurator } from '../generic/RouteConfigurator';
import { TrafficStatMonitor } from '../generic/monitor/TrafficStatMonitor';
import { GenericAuthConfigurator } from '../generic/AuthConfigurator';

export interface CiscoCredential {
    snmpCredential: SNMPClientConfig,
    sshCredential: SSHCredential,
}
export class ControllerFactory extends GenericControllerFactory {
    private snmp: SNMPClient | null = null;
    private mibFile: string;
    private tftpServer: CiscoTFTPServer;
    private sshClient: CiscoSSHClient | undefined;
    private svcRunner: SvcRunner;

    constructor(deviceaddress: string, mibFile: string, tftpServer: CiscoTFTPServer) {
        super(deviceaddress);
        this.mibFile = mibFile; 
        this.tftpServer = tftpServer;

        const launcherPath = path.join(__dirname, '../../../ciscocfg/launcher.sh');
        this.svcRunner = new SvcRunner(launcherPath);
    }

    public async authenticate(credential: CiscoCredential) {
        const mibLoader = new MIBLoader(this.mibFile);
        await mibLoader.init();
        this.snmp = new SNMPClient(this.deviceaddress, credential.snmpCredential, mibLoader);
        this.snmp.connect();
        this.sshClient = new CiscoSSHClient(this.deviceaddress, 22, credential.sshCredential, {
            algorithms: {
                kex: [
                    'diffie-hellman-group-exchange-sha1',
                    'diffie-hellman-group1-sha1',
                    'diffie-hellman-group14-sha1'
                ],
            },
        });
    }

    public async refreshAuth(): Promise<void> {
        // Eat up
    }

    public async init() {
        //await this.svcRunner.start();
    }

    public getSwitchConfigurator(): CiscoSwitchConfigurator {
        if (this.snmp == null || this.sshClient == null) {
            throw new AuthError('Not authenticated.');
        }

        return new CiscoSwitchConfigurator(this.snmp, this.sshClient, this.tftpServer);
    }

    public getSwitchQoS(): CiscoSwitchQoS {
        if (this.snmp == null || this.sshClient == null) {
            throw new AuthError('Not authenticated.');
        }

        return new CiscoSwitchQoS(this.snmp, this.sshClient, this.tftpServer);
    }

    public getWLANConfigurator(): WLANConfigurator {
        throw new MethodNotImplementedError();
    }

    public getWLANUserDeviceStat(): WLANUserDeviceStat {
        throw new MethodNotImplementedError();
    }

    public getLogman(): Logman {
        if (this.snmp == null || this.sshClient == null) {
            throw new AuthError('Not authenticated.');
        }

        return new Logman(this.snmp, this.sshClient, this.tftpServer);
    }

    public getFirewallConfigurator(): FirewallConfigurator {
        throw new MethodNotImplementedError();
    }

    public getNetTester(): NetTester {
        throw new MethodNotImplementedError();
    }

    public getRouteConfigurator(): RouteConfigurator {
        throw new MethodNotImplementedError();
    }
    
    public getTrafficStatMonitor(): TrafficStatMonitor {
        throw new MethodNotImplementedError();
    }

    public getAuthConfigurator(): GenericAuthConfigurator{
        throw new MethodNotImplementedError();
    }
}

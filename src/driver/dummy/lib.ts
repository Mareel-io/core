import { NetTester } from '../efm/monitor/NetTester';
import { FirewallConfigurator } from '../generic/FirewallConfigurator';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { Logman } from '../generic/Logman';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { SwitchConfigurator as DummySwitchConfigurator } from './SwitchConfigurator';

export class ControllerFactory extends GenericControllerFactory {
    constructor(deviceaddress = 'nowhere') {
        super(deviceaddress);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async authenticate(credential: any): Promise<void> {
        console.log('DummyControllerFactory: Auth OK');
    }

    public getSwitchConfigurator(): DummySwitchConfigurator {
        return new DummySwitchConfigurator();
    }

    public getWLANConfigurator(): WLANConfigurator {
        throw new Error('Method not implemented.');
    }
    public getWLANUserDeviceStat(): WLANUserDeviceStat {
        throw new Error('Method not implemented.');
    }
    public getLogman(): Logman {
        throw new Error('Method not implemented.');
    }
    public getFirewallConfigurator(): FirewallConfigurator {
        throw new Error('Method not implemented.');
    }
    public getNetTester(): NetTester {
        throw new Error('Method not implemented.');
    }
}

import { NetTester } from '../efm/monitor/NetTester';
import { FirewallConfigurator } from '../generic/FirewallConfigurator';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { Logman } from '../generic/Logman';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { SwitchConfigurator as DummySwitchConfigurator } from './SwitchConfigurator';

export class ControllerFactory extends GenericControllerFactory {
    constructor(deviceaddress: string = 'nowhere') {
        super(deviceaddress);
    }

    public async authenticate(credential: any): Promise<void> {
        console.log('DummyControllerFactory: Auth OK');
    }

    public getSwitchConfigurator(): DummySwitchConfigurator {
        return new DummySwitchConfigurator();
    }

    public getWLANConfigurator(...params: any): WLANConfigurator {
        throw new Error('Method not implemented.');
    }
    public getWLANUserDeviceStat(...params: any): WLANUserDeviceStat {
        throw new Error('Method not implemented.');
    }
    public getLogman(...params: any): Logman {
        throw new Error('Method not implemented.');
    }
    public getFirewallConfigurator(...params: any): FirewallConfigurator {
        throw new Error('Method not implemented.');
    }
    public getNetTester(...params: any): NetTester {
        throw new Error('Method not implemented.');
    }
}
import { NetTester } from '../efm/monitor/NetTester';
import { FirewallConfigurator } from '../generic/FirewallConfigurator';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { Logman } from '../generic/Logman';
import { SwitchConfigurator } from '../generic/SwitchConfigurator';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';

export class ControllerFactory extends GenericControllerFactory {
    private apiToken: string | undefined;

    constructor(deviceaddress: string) {
        super(deviceaddress);
        //
    }

    public async authenticate(token: string): Promise<void> {
        this.apiToken = token;

        // TODO: Check token validity
    }

    public async refreshAuth(): Promise<void> {
        // Do nothing.
    }

    public getWLANConfigurator(deviceId?: string): WLANConfigurator {
        throw new Error('Feature not supported');
    }

    public getWLANUserDeviceStat(deviceId?: string): WLANUserDeviceStat {
        throw new Error('Feature not supported');
    }

    public getSwitchConfigurator(deviceId?: string): SwitchConfigurator {
        throw new Error('Method not implemented.');
    }

    public getLogman(deviceId?: string): Logman {
        throw new Error('Method not implemented.');
    }

    public getFirewallConfigurator(deviceId?: string): FirewallConfigurator {
        throw new Error('Method not implemented.');
    }

    public getNetTester(deviceId?: string): NetTester {
        throw new Error('Feature not supported');
    }
}
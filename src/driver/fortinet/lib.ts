import axios, { AxiosInstance } from 'axios';
import { AuthError } from '../../error/MarilError';
import { NetTester } from '../efm/monitor/NetTester';
import { FirewallConfigurator } from '../generic/FirewallConfigurator';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { Logman } from './Logman';
import { SwitchConfigurator } from './SwitchConfigurator';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { FortigateQoS } from './FortigateQoS';

export class ControllerFactory extends GenericControllerFactory {
    private api: AxiosInstance;
    private apiToken: string | undefined;

    constructor(deviceaddress: string) {
        super(deviceaddress);
        
        this.api = axios.create({
            baseURL: deviceaddress,
        });
    }

    public async authenticate(token: string): Promise<void> {
        this.apiToken = token;
        this.api.defaults.headers['Authorization'] = `Bearer ${this.apiToken}`

        try {
            await this.api.get('/api/v2/monitor/system/debug');
        } catch(e) {
            // Failed to auth. :(
            throw new AuthError('Token rejected.');
        }
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
        return new SwitchConfigurator(this.api);
    }

    public getLogman(deviceId?: string): Logman {
        return new Logman(this.api);
    }

    public getFirewallConfigurator(deviceId?: string): FirewallConfigurator {
        throw new Error('Method not implemented.');
    }

    public getNetTester(deviceId?: string): NetTester {
        throw new Error('Feature not supported');
    }

    public getQoSConfigurator(): FortigateQoS {
        throw new Error('Method not implemented.');
    }
}
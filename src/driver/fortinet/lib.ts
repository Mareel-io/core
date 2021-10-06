import https from 'https';
import axios, { AxiosInstance } from 'axios';
import { AuthError, InvalidParameterError, UnsupportedFeatureError } from '../../error/MarilError';
import { NetTester } from '../efm/monitor/NetTester';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { Logman } from './Logman';
import { SwitchConfigurator } from './SwitchConfigurator';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { FortigateQoS } from './FortigateQoS';
import { RouteConfigurator as FortigateRouteConfigurator } from './RouteConfigurator';
import { SwitchQoS } from '../generic/SwitchQoS';
import { FirewallConfigurator } from './FirewallConfigurator';
import { FortiAuthToken } from './util/types';

export class ControllerFactory extends GenericControllerFactory {
    private api: AxiosInstance;
    private apiToken: FortiAuthToken | undefined;
    private baseURL: string;

    constructor(deviceaddress: string) {
        super(deviceaddress);
        this.baseURL = deviceaddress;
        this.api = axios.create(); // Dummy.
    }

    public async authenticate(token: FortiAuthToken): Promise<void> {
        this.apiToken = token;

        switch(this.apiToken.type) {
            case 'token':
                if (typeof this.apiToken.credential !== 'string') {
                    throw new InvalidParameterError('Bad credential type');
                }

                this.api = axios.create({
                    baseURL: this.baseURL,
                    httpsAgent: new https.Agent({
                        ca: this.apiToken.ca,
                    }),
                });
                this.api.defaults.headers['Authorization'] = `Bearer ${this.apiToken.credential as string}`;
                break;
            case 'pki':
                if (typeof this.apiToken.credential === 'string') {
                    throw new InvalidParameterError('Bad credential type');
                }

                this.api = axios.create({
                    baseURL: this.baseURL,
                    httpsAgent: new https.Agent({
                        ca: this.apiToken.ca,
                        cert: this.apiToken.credential.cert,
                        key: this.apiToken.credential.key,
                    }),
                });
                break;
            default:
                throw new UnsupportedFeatureError(`Unsupproted token type ${this.apiToken.type}`);
        }

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
        return new FirewallConfigurator(this.api);
    }

    public getNetTester(deviceId?: string): NetTester {
        throw new Error('Feature not supported');
    }

    public getSwitchQoS(deviceId?: string): SwitchQoS {
        throw new UnsupportedFeatureError('Feature not supported');
    }

    public getQoSConfigurator(): FortigateQoS {
        throw new Error('Method not implemented.');
    }

    public getRouteConfigurator(): FortigateRouteConfigurator {
        return new FortigateRouteConfigurator(this.api);
    }
}

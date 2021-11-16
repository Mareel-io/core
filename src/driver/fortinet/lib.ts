import https from 'https';
import axios, { AxiosInstance } from 'axios';
import { AuthError, InvalidParameterError, MethodNotImplementedError, UnsupportedFeatureError } from '../../error/MarilError';
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
import { FortiTrafficStatMonitor } from './monitor/TrafficStat';
import { FortiAuthToken } from './util/types';
import { logger } from '../../util/logger';
import { FortiAuthConfigurator } from './AuthConfigurator';
import { FortiVPNConfigurator } from './VPNConfigurator';
import { FortiProfileManager } from './ProfileManager';

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
                        rejectUnauthorized: !this.apiToken.allowInvalidCertificate,
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
            await this.api.get('/api/v2/monitor/web-ui/extend-session');
        } catch(e) {
            logger.warning('Auth rejected.');
            logger.warning(e);
            // Failed to auth. :(
            throw new AuthError('Token rejected.');
        }
    }

    public async refreshAuth(): Promise<void> {
        // Do nothing.
    }

    public getWLANConfigurator(): WLANConfigurator {
        throw new UnsupportedFeatureError('Feature not supported');
    }

    public getWLANUserDeviceStat(): WLANUserDeviceStat {
        throw new UnsupportedFeatureError('Feature not supported');
    }

    public getSwitchConfigurator(): SwitchConfigurator {
        return new SwitchConfigurator(this.api);
    }

    public getLogman(): Logman {
        return new Logman(this.api);
    }

    public getFirewallConfigurator(): FirewallConfigurator {
        return new FirewallConfigurator(this.api);
    }

    public getNetTester(): NetTester {
        throw new UnsupportedFeatureError('Feature not supported');
    }

    public getSwitchQoS(): SwitchQoS {
        throw new UnsupportedFeatureError('Feature not supported');
    }

    public getQoSConfigurator(): FortigateQoS {
        throw new MethodNotImplementedError('Method not implemented.');
    }

    public getRouteConfigurator(): FortigateRouteConfigurator {
        return new FortigateRouteConfigurator(this.api);
    }

    public getTrafficStatMonitor(): FortiTrafficStatMonitor {
        return new FortiTrafficStatMonitor(this.api);
    }

    public getAuthConfigurator(): FortiAuthConfigurator {
        return new FortiAuthConfigurator(this.api);
    }

    public getVPNConfigurator(): FortiVPNConfigurator {
        return new FortiVPNConfigurator(this.api);
    }

    public getProfileManager(): FortiProfileManager {
        return new FortiProfileManager(this.api);
    }
}

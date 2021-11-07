import { MethodNotImplementedError } from '../../error/MarilError';
import { NetTester } from '../efm/monitor/NetTester';
import { FirewallConfigurator } from '../generic/FirewallConfigurator';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { Logman } from '../generic/Logman';
import { SwitchQoS } from '../generic/SwitchQoS';
import { RouteConfigurator } from '../generic/RouteConfigurator';
import { WLANConfigurator } from '../generic/wlan';
import { WLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { SwitchConfigurator as DummySwitchConfigurator } from './SwitchConfigurator';
import { TrafficStatMonitor } from '../generic/monitor/TrafficStatMonitor';
import { logger } from '../../util/logger';
import { GenericAuthConfigurator } from '../generic/AuthConfigurator';

export class ControllerFactory extends GenericControllerFactory {
    constructor(deviceaddress = 'nowhere') {
        super(deviceaddress);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async authenticate(credential: any): Promise<void> {
        logger.debug('DummyControllerFactory: Auth OK');
    }

    public async refreshAuth(): Promise<void> {
        logger.debug('DummyControllerFactory: Auth OK');
    }

    public getSwitchConfigurator(): DummySwitchConfigurator {
        return new DummySwitchConfigurator();
    }

    public getSwitchQoS(): SwitchQoS {
        throw new MethodNotImplementedError();
    }

    public getWLANConfigurator(): WLANConfigurator {
        throw new MethodNotImplementedError();
    }
    public getWLANUserDeviceStat(): WLANUserDeviceStat {
        throw new MethodNotImplementedError();
    }
    public getLogman(): Logman {
        throw new MethodNotImplementedError();
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
    public getAuthConfigurator(): GenericAuthConfigurator {
        throw new MethodNotImplementedError();
    }
}

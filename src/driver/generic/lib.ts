import { NetTester } from "../efm/monitor/NetTester";
import { GenericAuthConfigurator } from "./AuthConfigurator";
import { FirewallConfigurator } from "./FirewallConfigurator";
import { Logman } from "./Logman";
import { TrafficStatMonitor } from "./monitor/TrafficStatMonitor";
import { GenericProfileManager } from "./ProfileManager";
import { RouteConfigurator } from "./RouteConfigurator";
import { SwitchConfigurator } from "./SwitchConfigurator";
import { SwitchQoS } from "./SwitchQoS";
import { VPNConfigurator } from "./VPNConfigurator";
import { WLANConfigurator } from "./wlan";
import { WLANUserDeviceStat } from "./WLANUserDeviceStat";

export abstract class ControllerFactory {
    protected deviceaddress: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected credential: any;
    constructor(deviceaddress: string) {
        this.deviceaddress = deviceaddress;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    protected updateCredential(cred: any): void {
        this.credential = cred;
    }

    /**
     * Dummy function (placeholder for children)
     */
    public async init(): Promise<void> {
        // Do nothing
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract authenticate(credential: any): Promise<void>;
    public abstract refreshAuth(): Promise<void>;
    public abstract getWLANConfigurator(deviceId?: string): WLANConfigurator;
    public abstract getWLANUserDeviceStat(deviceId?: string): WLANUserDeviceStat;
    public abstract getSwitchConfigurator(deviceId?: string): SwitchConfigurator;
    public abstract getSwitchQoS(deviceId?: string): SwitchQoS;
    public abstract getLogman(deviceId?: string): Logman;
    public abstract getFirewallConfigurator(deviceId?: string): FirewallConfigurator;
    public abstract getNetTester(deviceId?: string): NetTester;
    public abstract getRouteConfigurator(deviceId?: string): RouteConfigurator;
    public abstract getTrafficStatMonitor(deviceId?: string): TrafficStatMonitor;
    public abstract getAuthConfigurator(deviceId?: string): GenericAuthConfigurator;
    public abstract getVPNConfigurator(deviceId?: string): VPNConfigurator;
    public abstract getProfileManager(deviceId?: string): GenericProfileManager;
}

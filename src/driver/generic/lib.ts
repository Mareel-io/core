import { NetTester } from "../efm/monitor/NetTester";
import { FirewallConfigurator } from "./FirewallConfigurator";
import { Logman } from "./Logman";
import { SwitchConfigurator } from "./SwitchConfigurator";
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
    public abstract getWLANConfigurator(deviceId?: string): WLANConfigurator;
    public abstract getWLANUserDeviceStat(deviceId?: string): WLANUserDeviceStat;
    public abstract getSwitchConfigurator(deviceId?: string): SwitchConfigurator;
    public abstract getLogman(deviceId?: string): Logman;
    public abstract getFirewallConfigurator(deviceId?: string): FirewallConfigurator;
    public abstract getNetTester(deviceId?: string): NetTester;
}
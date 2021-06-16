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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract getWLANConfigurator(...params: any): WLANConfigurator;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract getWLANUserDeviceStat(...params: any): WLANUserDeviceStat;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract getSwitchConfigurator(...params: any): SwitchConfigurator;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract getLogman(...params: any): Logman;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract getFirewallConfigurator(...params: any): FirewallConfigurator;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public abstract getNetTester(...params: any): NetTester;
}
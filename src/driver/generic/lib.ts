import { SwitchConfigurator } from "./SwitchConfigurator";

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
    public abstract getSwitchConfigurator(...params: any): SwitchConfigurator;
}
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    abstract authenticate(credential: any): Promise<void>;
}
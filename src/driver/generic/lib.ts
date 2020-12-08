export abstract class ControllerFactory {
    protected deviceaddress: string;
    protected credential: any;
    constructor(deviceaddress: string) {
        this.deviceaddress = deviceaddress;
    }

    protected updateCredential(cred: any) {
        this.credential = cred;
    }

    abstract authenticate(credential: any): Promise<void>;
}
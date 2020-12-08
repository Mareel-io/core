import axios, { AxiosInstance } from 'axios';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { WLANConfigurator as EFMWLANConfigurator } from './wifi';

export class ControllerFactory extends GenericControllerFactory {
    protected api: AxiosInstance;
    constructor(deviceaddress: string) {
        super(deviceaddress);

        this.api = axios.create({
            baseURL: deviceaddress,
            headers: {
                Referer: deviceaddress, // CSRF bypass
            },
        });
    }

    public getWLANConfigurator(): EFMWLANConfigurator {
        return new EFMWLANConfigurator(this.api);
    }
}
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { WLANConfigurator as EFMWLANConfigurator } from './wlan';
import qs from 'qs';

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

    public async authenticate(credential: {id: string, pass: string}) {
        const form = qs.stringify({
            init_status: 1,
            captcha_on: 0, // Cannot support captcha_on=1, unless we train the neural net.
            useranem: credential.id,
            passwd: credential.pass,
        });
        const res = await this.api.post('/sess-bin/login_handler.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Debug output
        console.log(res);

        // TODO: Extract efm_session_id from response javascript
    }

    public getWLANConfigurator(): EFMWLANConfigurator {
        return new EFMWLANConfigurator(this.api);
    }
}
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { WLANConfigurator as EFMWLANConfigurator } from './wlan';

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
        const form = new FormData();
        form.append('init_status', 1);
        form.append('captcha_on', 0); // Cannot support captcha_on, unless we train the neural net.
        form.append('username', credential.id);
        form.append('passwd', credential.pass);
        const res = await this.api.post('/sess-bin/login_handler.cgi', form, {
            headers: form.getHeaders(),
        });

        // TODO: Extract efm_session_id from response javascript
    }

    public getWLANConfigurator(): EFMWLANConfigurator {
        return new EFMWLANConfigurator(this.api);
    }
}
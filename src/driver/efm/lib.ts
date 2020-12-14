import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { WLANConfigurator as EFMWLANConfigurator } from './wlan';
import qs from 'qs';
import { WLANUserDeviceStat } from './WLANUserDeviceStat';

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
            username: credential.id,
            passwd: credential.pass,
        });
        const res = await this.api.post('/sess-bin/login_handler.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Cookie extraction
        // Executing JS in sandbox? I don't think that is good idea...
        if (res == null || res.data == null) {
            throw new Error('Authentication rejected.');
        }
        const cookie: string | null = res.data.match(/setCookie\('([^']*)'\);/)[1]

        if (cookie == null) {
            throw new Error('Authentication rejected.');
        }

        this.credential = cookie;
        this.api.defaults.headers['Cookie'] = `efm_session_id=${encodeURIComponent(cookie)}`
    }

    public getWLANConfigurator(): EFMWLANConfigurator {
        return new EFMWLANConfigurator(this.api);
    }

    public getWLANUserDeviceStat(): WLANUserDeviceStat {
        return new WLANUserDeviceStat(this.api);
    }
}
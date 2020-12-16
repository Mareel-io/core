import axios, { AxiosInstance } from 'axios';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { WLANConfigurator as EFMWLANConfigurator } from './wlan';
import qs from 'qs';
import { WLANUserDeviceStat } from './WLANUserDeviceStat';
import { SwitchConfigurator } from './SwitchConfigurator';

export class ControllerFactory extends GenericControllerFactory {
    protected api: AxiosInstance;
    /**
     * EFMControllerFactory constructor
     * 
     * @param deviceaddress - Target device address (e.g. http://192.168.0.1/)
     */
    constructor(deviceaddress: string) {
        super(deviceaddress);

        this.api = axios.create({
            baseURL: deviceaddress,
            headers: {
                Referer: deviceaddress, // CSRF bypass
            },
        });
    }

    /**
     * Log-in ipTIME router with given credential and get session cookie from the result.
     *  
     * @param credential - authentication credential of ipTIME router
     */
    public async authenticate(credential: {id: string, pass: string}): Promise<void> {
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

    /**
     * Get EFMWLANConfigurator object.
     * 
     * @returns EFMWLANConfiguratior object with authentication cookie
     */
    public getWLANConfigurator(): EFMWLANConfigurator {
        return new EFMWLANConfigurator(this.api);
    }

    /**
     * Get WLANUserDeviceStat object.
     * 
     * @returns WLANUserDeviceStat object with authentication cookie
     */
    public getWLANUserDeviceStat(): WLANUserDeviceStat {
        return new WLANUserDeviceStat(this.api);
    }

    /**
     * Get SwitchConfigurator object
     * 
     * @returns SwitchConfigurator object with auth cookie.
     */
    public getSwitchConfigurator(): SwitchConfigurator {
        return new SwitchConfigurator(this.api);
    }
}
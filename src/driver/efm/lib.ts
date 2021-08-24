import axios, { AxiosInstance } from 'axios';
import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { WLANConfigurator as EFMWLANConfigurator } from './wlan';
import qs from 'qs';
import { WLANUserDeviceStat } from './WLANUserDeviceStat';
import { SwitchConfigurator } from './SwitchConfigurator';
import { JSDOM } from 'jsdom';
import { EFMCaptcha } from './CredentialConfigurator';
import { Logman } from './Logman';
import { ResponseChecker } from './ResponseChecker';
import { FirewallConfigurator } from './FirewallConfigurator';
import { NetTester } from './monitor/NetTester';
import { AuthError, UnsupportedFeatureError } from '../../error/MarilError';
import { SwitchQoS } from '../generic/SwitchQoS';

export class ControllerFactory extends GenericControllerFactory {
    protected api: AxiosInstance;
    protected login: {id: string, pass: string} | null = null;
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
     * Get CAPTCHA challenge from router
     * 
     * @returns Captcha image(gif) with its name
     */
    public async getCaptchaChallenge(): Promise<{ name: string, data: Buffer }> {
        const res = await this.api.get('/sess-bin/captcha.cgi');
        ResponseChecker.check(res.data);
        
        const page = new JSDOM(res.data);
        const imageElem = page.window.document.body.getElementsByTagName('img').item(0);
        const fileNameElem = page.window.document.body.getElementsByTagName('input').item(0);
        const filename = (fileNameElem as Element).getAttribute('value') as string;
        const imageURL = (imageElem as Element).getAttribute('src') as string;

        const imageRes = await this.api.get(imageURL, { responseType: 'arraybuffer' });
        ResponseChecker.check(imageRes.data);

        return {
            name: filename,
            data: Buffer.from(imageRes.data),
        };
    }

    /**
     * Log-in ipTIME router with given credential and get session cookie from the result.
     *  
     * @param credential - authentication credential of ipTIME router
     * @param captcha - CAPTCHA login support. You must supply captcha filename and challenge response
     */
    public async authenticate(credential: {id: string, pass: string}, captcha: EFMCaptcha | null = null): Promise<void> {
        this.login = credential;
        const formbase = {
            init_status: 1,
            captcha_on: 0,
            username: credential.id,
            passwd: credential.pass,
            captcha_file: undefined as string | undefined,
            captcha_code: undefined as string | undefined,
        };

        if (captcha != null) {
            formbase.captcha_on = 1;
            formbase.captcha_file = captcha.filename;
            formbase.captcha_code = captcha.code;
        }
        const form = qs.stringify(formbase);
        const res = await this.api.post('/sess-bin/login_handler.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        ResponseChecker.check(res.data);

        // Cookie extraction
        // Executing JS in sandbox? I don't think that is good idea...
        if (res == null || res.data == null) {
            throw new AuthError('Authentication rejected.');
        }
        const match = res.data.match(/setCookie\('([^']*)'\);/);
        const cookie: string | null = match == null ? null : match[1];

        if (cookie == null) {
            throw new AuthError('Authentication rejected.');
        }

        this.authCookie = cookie;
    }

    public async refreshAuth(): Promise<void> {
        if (this.login != null) {
            await this.authenticate(this.login, null);
        } else {
            throw new AuthError('No credential available for refreshing');
        }
    }

    /**
     * Set credential using EFM ipTIME auth cookie.
     */
    public set authCookie(cookie: string) {
        this.credential = cookie;
        this.api.defaults.headers['Cookie'] = `efm_session_id=${encodeURIComponent(cookie)}`
    }

    /**
     * Retreve authenticaion session cookie.
     */
    public get authCookie(): string {
        return this.credential;
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

    public getSwitchQoS(): SwitchQoS {
        throw new UnsupportedFeatureError();
    }

    /**
     * Get log manager object
     * 
     * @returns Logman object with auth cookie.
     */
    public getLogman(): Logman {
        return new Logman(this.api);
    }

    /**
     * Get firewall configurator object
     */
    public getFirewallConfigurator(): FirewallConfigurator {
        return new FirewallConfigurator(this.api);
    }

    public getNetTester(): NetTester {
        return new NetTester(this.api);
    }
}
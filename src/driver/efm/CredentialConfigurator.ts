import { AxiosInstance } from "axios";
import qs from 'qs';
import { ResponseChecker } from "./ResponseChecker";

export interface EFMCaptcha {
    filename: string,
    code: string,
}

export class CredentialConfigurator {
    private api: AxiosInstance;
    constructor (api: AxiosInstance) {
        this.api = api;
    }

    /**
     * Change ipTIME password
     * 
     * @param newpassword - new password for admin account
     * @param captcha - CAPTCHA challenge response in EFMCaptcha object
     */
    public async updatePassword(newpassword: string, captcha: EFMCaptcha): Promise<void> {
        const form = qs.stringify({
            act: 'save',
            tmenu: 'iframe',
            smenu: 'hiddenloginsetup',
            captcha_file: captcha.filename,
            captcha_code: captcha.code,
            new_passwd: newpassword,
            new_login: 'admin',
        });

        const res = await this.api.post('/sess-bin/timepro.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        ResponseChecker.check(res.data);
    }

    /**
     * Enable / disable CAPTCHA on authentication page.
     * For bot purpose, it is recommended to disable authentication captcha.
     * 
     * @param enable - Enable / disable CAPTCHA on authentication page.
     */
    public async setAuthCaptcha(enable: boolean): Promise<void> {
        const form = qs.stringify({
            act: 'session_save',
            tmenu: 'iframe',
            smenu: 'hiddenloginsetup',
            http_auth: 'session',
            http_session_timeout: 10,
            use_captcha: enable ? 'always' : 'off',
            captcha_attempt: 3,
        });

        const res = await this.api.post('/sess-bin/timepro.cgi', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        ResponseChecker.check(res.data);
    }
}
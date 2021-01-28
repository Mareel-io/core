import { AxiosInstance } from "axios";
import { JSDOM } from "jsdom";
import { ResourceNotAvailableError, UnsupportedFeatureError } from "../../../error/MarilError";
import { ResponseChecker } from "../ResponseChecker";
import { sleep } from '../../../util/sleep';
import qs from 'qs';

// TODO: Implement locking for async operation
const lockTable: {[key: string]: boolean | undefined} = {};

export class NetTester {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        this.api = api;
    }

    protected async requestPingTest(ipaddr: string) {
        const payload: {[key: string]: string | number} = {};

        const splittedAddr = ipaddr.split('.');

        payload.tmenu = 'iframe';
        payload.smenu = 'hostscansubmit';
        payload.datasize = 100; // ICMP Ping size
        payload.ip1 = splittedAddr[0];
        payload.ip2 = splittedAddr[1];
        payload.ip3 = splittedAddr[2];
        payload.ip4 = splittedAddr[3];
        payload.timeout = 1;
        payload.ping_type=0; // Leave it alone. ICMP ping
        payload.count = 3;
        payload.act = 'start';
        payload.sel = 0;
        
        await this.api.post('/sess-bin/timepro.cgi', qs.stringify(payload), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    protected async readTestResult() {
        const payload: {[key: string]: string | number} = {
            tmenu: 'iframe',
            smenu: 'hostscanstatus',
        };

        const res = await this.api.post('/sess-bin/timepro.cgi', qs.stringify(payload), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        ResponseChecker.check(res.data);

        const dom = new JSDOM(res.data);

        const logTbl = dom.window.document.body.getElementsByTagName('tr');
        let log = '';

        for (let i = 0; i < logTbl.length; i++) {
            const entry = logTbl[i];
            const message = entry.textContent;

            if(message?.trim().length === 0) {
                continue;
            }

            log += message?.trim() + '\n';
        }

        return log;
    }

    protected async readFullTestResult(timeout: number) {
        let flag = false;
        // Set up timer
        sleep(timeout).then(() => {
            flag = true;
        });

        let result = '';
        while (!flag) {
            result = await this.readTestResult();
            if (result.match(/.*Sent.*/) != null) {
                flag = true;
            }
            await sleep(100);
        }

        return result;
    }

    /**
     * Test network using router's built in function
     * @param method - test method, only icmp_ping is supported for ipTIME devices
     * @param target - test target. only ipv4 address is supported for ipTIME devices
     */
    public async testNetwork(method: string, target: string) {
        const targetUrl = this.api.defaults.baseURL;

        if (method != 'icmp_ping') {
            // EFM does not support scan method other then ping
            throw new UnsupportedFeatureError(`Not supported method: ${method}`);
        }

        try {
            if (!(lockTable[targetUrl as string])) {
                lockTable[targetUrl as string] = true;
                await this.requestPingTest(target);
                // Wait for 100msec first...
                await sleep(100);
                return await this.readFullTestResult(10000);
            } else {
                // Locked!
                throw new ResourceNotAvailableError('Another scanning in progress');
            }
        } finally {
            // Unlock
            lockTable[targetUrl as string] = false;
        }
    }
}
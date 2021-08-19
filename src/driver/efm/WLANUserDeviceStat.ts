import { AxiosInstance } from 'axios';
import { JSDOM } from 'jsdom';
import { InvalidParameterError } from '../../error/MarilError';
import { WLANUserDeviceStat as GenericWLANUserDeviceStat } from '../generic/WLANUserDeviceStat';
import { ResponseChecker } from './ResponseChecker';
import { User80211Device } from './User80211Device';

export class WLANUserDeviceStat extends GenericWLANUserDeviceStat {
    protected api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    private parseTime(str: string, baseTime = 0): number {
        const parseRes = str.match(/([0-9]+)[ ]*([가-힣]+)(.*)$/);
        if (parseRes == null) {
            return baseTime;
        }
        const base = parseInt(parseRes[1], 10);
        const multStr = parseRes[2];
        let multiplier = 1;

        switch(multStr) {
            case '일':
                multiplier = 86400;
                break;
            case '시간': 
                multiplier = 3600;
                break;
            case '분':
                multiplier = 60;
                break;
            case '초':
                multiplier = 1;
                break;
            default:
                throw new InvalidParameterError(`Invalid time multiplier: ${multStr}`);
        }
        return this.parseTime(parseRes[3], base * multiplier + baseTime);
    }

    public async getUserDevices(devname: 'wlan5g' | 'wlan2g', ifname: string): Promise<User80211Device[]> {
        const bssidx = (devname === 'wlan5g' ? 65536 : 0) + parseInt(ifname, 10);
        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: {
                tmenu: 'iframe',
                smenu: 'macauth_pcinfo_status',
                bssidx: bssidx,
            },
        });
        ResponseChecker.check(res.data);

        const dom = new JSDOM(res.data);
        const rows = dom.window.document.body.getElementsByTagName('tr');
        // TODO: FIXME
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: [{mac: string, bandwidth: string, uptime: number, ip: string}] = [] as any;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cols = row.getElementsByTagName('td');
            if (cols.length < 4) {
                continue;
            }

            const entry = {
                mac: cols[0].innerHTML.replace(/-/g, ':'),
                bandwidth: cols[1].innerHTML,
                uptime: this.parseTime(cols[2].innerHTML),
                ip: cols[3].innerHTML,
            };

            console.log(entry);

            list.push(entry);
        }

        const ret: User80211Device[] = [];
        for (const i of list) {
            const rxspd = i.bandwidth.split('/')[0];
            const txspd = i.bandwidth.split('/')[1].replace(/[a-zA-Z]*/g, '');
            const entry = new User80211Device();
            entry.macaddr = i.mac;
            entry.linkspeed = {
                rx: parseInt(rxspd, 10),
                tx: parseInt(txspd, 10),
            };
            entry.uptime = i.uptime;
            ret.push(entry);
        }

        return ret;
    }
}
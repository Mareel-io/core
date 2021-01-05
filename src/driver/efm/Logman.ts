import { AxiosInstance } from 'axios';
import { JSDOM } from 'jsdom';
import { Logman as GenericLogman, LogEntry } from '../generic/Logman';
import moment from 'moment';
export { LogEntry };

export class Logman extends GenericLogman {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    /**
     * Retrieve system log (EFM specific)
     * 
     * @param from - Log start date
     * @param to - Log end date
     */
    private async syslog(from: Date | undefined, to: Date | undefined): Promise<LogEntry[]> {
        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: {
                tmenu: 'iframe',
                smenu: 'sysconf_syslog_log',
            }
        });

        const dom = new JSDOM(res.data);
        const logTbl = dom.window.document.body.getElementsByClassName('tr');

        const logArr = [] as unknown as [LogEntry];
        for (let i = 0; i < logTbl.length; i++) {
            const entry = logTbl[i];
            const children = entry.childNodes;
            if (!(children[1] instanceof HTMLElement)) continue;
            let timestamp = moment(children[0].textContent, 'YYYY/MM/DD HH:mm:ss');
            const message = children[1].textContent;

            if (timestamp == null) {
                timestamp = moment('1970-01-01T00:00:00Z');
            }

            logArr.push(new LogEntry(timestamp.toDate(), `${message}`));
        }

        logArr.filter((elem) => {
            let flag = true;
            if (from != null) {
                flag &&= moment(elem.timestamp).isSameOrAfter(moment(from));
                if (to != null) {
                    flag &&= moment(elem.timestamp).isSameOrBefore(moment(to));
                }
            }

            return flag;
        });

        return logArr;
    }

    /**
     * Retrieve log from target
     * 
     * @param source - Log source. ipTIME only supports syslog.
     * @param from - Log start date
     * @param to - Log end date
     */
    public async queryLog(source: string, from: Date | undefined, to: Date| undefined): Promise<LogEntry[]> {
        if (source == 'syslog') {
            return this.syslog(from, to);
        } else {
            throw new Error(`Unsupported source ${source}`);
        }
    }
}

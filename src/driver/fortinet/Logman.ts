import axios, { AxiosInstance } from 'axios';
import moment from 'moment';
import { StringMappingType } from 'typescript';
import { Logman as GenericLogman, LogEntry } from '../generic/Logman';

interface FortiOSLog {
    date: string,
    time: string,
    eventtime: string,
    tz: string,
    logid: string,
    type: string,
    subtype: string,
    level: string,
    vd: string,
    logdesc: string,
    action: string,
    cpu: number,
    mem: number,
    totalsession: number,
    disk: number,
    bandwidth: string,
    setuprate: number,
    disklograte: number,
    gbazlograte: number,
    freediskstorage: number,
    sysuptime: number,
    waninfo: string,
    msg: string,
    _metadata: {
        "#": string,
        logid: number,
        timestamp: number,
        roll: number
    }
}

export class Logman extends GenericLogman {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    private async requestLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]> {
        // Partial implementation which ignores from and to
        // TODO: Complete meeee..
        const res = await this.api.get('api/v2/log/memory/event/system');

        const logs: FortiOSLog[] = res.data.results;

        return logs.map((elem) => {
            const timestamp = moment(`${elem.date}T${elem.time}${elem.tz}`);
            return new LogEntry(timestamp.toDate(), elem.msg);
        });
    }

    public async queryLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]> {
        return await this.requestLog(source, from, to);
    }
}

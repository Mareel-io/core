import axios, { AxiosInstance } from 'axios';
import moment from 'moment';
import { StringMappingType } from 'typescript';
import { Logman as GenericLogman, LogEntry } from '../generic/Logman';
import { FortiOSLog } from './util/types';

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

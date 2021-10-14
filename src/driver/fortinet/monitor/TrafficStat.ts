import { AxiosInstance } from "axios";
import { FortiResponse } from "../util/types";

export class FortiTrafficStat 
{
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    public async getTrafficStat(destzone: string) {
        const result = await this.api.get('/api/v2/monitor/fortiview/statistics', {
            params: {
                vdom: 'root',
                count: 300,
                device: 'disk',
                filter: JSON.stringify({}),
                ip_version: 'ipboth',
                realtime: true,
                report_by: 'source',
                sort_by='bytes',
            }
        });

        const resp: FortiResponse<FortiTrafficStat> = result.data;
    }
}
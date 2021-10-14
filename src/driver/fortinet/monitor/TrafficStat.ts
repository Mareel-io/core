import { AxiosInstance } from "axios";
import { TrafficStat, TrafficStatMonitor } from "../../generic/monitor/TrafficStatMonitor";
import { FortiResponse, FortiTrafficStat } from "../util/types";

export class FortiTrafficStatMonitor extends TrafficStatMonitor
{
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public async getTrafficStat(): Promise<TrafficStat[]> {
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

        return resp.results.details.map((elem) => {
            return {
                srcip: elem.srcaddr,
                dstip: elem.dstaddr,
                total_rx_pkt: elem.rx_packets,
                total_tx_pkt: elem.tx_packets,
                total_rx_bw: elem.rx_bandwidth,
                total_tx_bw: elem.tx_bandwidth,
                apps: elem.apps.map((app) => {
                    return {
                        count: app.count,
                        proto: app.protocol as unknown as 'TCP' | 'UDP',
                        port: app.port,
                    }
                }),
            }
        })
    }
}
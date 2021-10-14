export interface TrafficStat {
    srcip: string,
    dstip: string,
    apps: {
        count: number,
        proto: 'TCP' | 'UDP',
        port: number,
    }[],
    total_rx_pkt: number,
    total_tx_pkt: number,
    total_rx_bw: number,
    total_tx_bw: number,
}

export abstract class TrafficStatMonitor {
    public abstract getTrafficStat(): Promise<TrafficStat[]>;

    public async init(): Promise<void> {
        // Do nothing
    }
}
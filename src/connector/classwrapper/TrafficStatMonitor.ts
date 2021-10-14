import { TrafficStat, TrafficStatMonitor as GenericTrafficStatMonitor } from "../../driver/generic/monitor/TrafficStatMonitor";
import { RPCProvider } from "../jsonrpcv2";

export class RPCTrafficStatMonitor extends GenericTrafficStatMonitor {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getTrafficStat(): Promise<TrafficStat[]> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'TrafficStatMonitor',
            method: 'getTrafficStat',
            params: [],
        }) as Promise<TrafficStat[]>;
    }
}
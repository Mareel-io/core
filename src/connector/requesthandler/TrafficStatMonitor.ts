import { TrafficStat, TrafficStatMonitor as GenericTrafficStatMonitor, TrafficStatMonitor} from "../../driver/generic/monitor/TrafficStatMonitor";
import { RPCMethodTable, RPCRequestHandler } from "./RPCRequestHandler";

export class TrafficStatMonitorReqHandler extends RPCRequestHandler {
    private trafficStatMonitor: GenericTrafficStatMonitor;
    protected rpcMethodTable: RPCMethodTable = {
        getTrafficStat: async (): Promise<TrafficStat[]> => {
            return await this.trafficStatMonitor.getTrafficStat();
        }
    }

    constructor(deviceId: string, trafficStatMonitor: GenericTrafficStatMonitor) {
        super(deviceId, 'TrafficStatMonitor');
        this.trafficStatMonitor = trafficStatMonitor;
    }

    async init(): Promise<void> {
        await this.trafficStatMonitor.init();
    }
}
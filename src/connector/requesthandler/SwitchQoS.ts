import { SwitchQoS as CiscoSwitchQoS } from "../../driver/cisco/SwitchQoS";
import { CoSMap, DSCPMap, SwitchQoS as GenericSwitchQoS } from "../../driver/generic/SwitchQoS";
import { RPCMethodTable, RPCRequestHandler } from "./RPCRequestHandler";

export class SwitchQoSReqHandler extends RPCRequestHandler {
    private switchQoS: GenericSwitchQoS | CiscoSwitchQoS;
    protected rpcMethodTable: RPCMethodTable = {
        loadConfig: async (): Promise<void> => {
            if (this.switchQoS instanceof CiscoSwitchQoS) {
                await this.switchQoS.loadConfig();
            } else {
                return;
            }
        },
        applyConfig: async (): Promise<void> => {
            if (this.switchQoS instanceof CiscoSwitchQoS) {
                await this.switchQoS.applyConfig();
            } else {
                return;
            }
        },
        setQueuePriority: async (wrr: number[]): Promise<void> => {
            await this.switchQoS.setQueuePriority(wrr);
        },
        setStrictPriorityQ: async (idx: number): Promise<void> => {
            await this.switchQoS.setStrictPriorityQ(idx);
        },
        getQueuePriority: async (): Promise<number[]> => {
            return await this.switchQoS.getQueuePriority();
        },
        getStrictPriorityQ: async (idx: number): Promise<number> => {
            return await this.switchQoS.getStrictPriorityQ();
        },
        setDSCPMap: async (map: DSCPMap): Promise<void> => {
            await this.switchQoS.setDSCPMap(map);
        },
        setCoSMap: async (map: CoSMap): Promise<void> => {
            await this.switchQoS.setCoSMap(map);
        },
        getDSCPMap: async (): Promise<DSCPMap> => {
            return await this.switchQoS.getDSCPMap();
        },
        getCoSMap: async (): Promise<CoSMap> => {
            return await this.switchQoS.getCoSMap();
        }
    };

    constructor(deviceId: string, switchQoS: GenericSwitchQoS | CiscoSwitchQoS) {
        super(deviceId, 'SwitchConfigurator');
        this.switchQoS = switchQoS;
    }

    public async init(): Promise<void> {
        await this.switchQoS.init();
    }
}

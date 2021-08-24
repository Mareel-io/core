import { CoSMap, DSCPMap, SwitchQoS as GenericSwitchQoS } from "../../driver/generic/SwitchQoS";
import { RPCProvider } from "../jsonrpcv2";

export class RPCSwitchQoS extends GenericSwitchQoS {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    /**
     * load config from device.
     * 
     * This method must called before doing anything.
     * 
     * Note that, calling this method will throw out current
     * modification
     */
    public async loadConfig(): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'loadConfig',
            params: [],
        });
    }

    /**
     * Apply config to device.
     * 
     * This method must called after modifying the configuration.
     */
    public async applyConfig(): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'applyConfig',
            params: [],
        });
    }

    /**
     * Set Queue priority
     * @param wrr WRR numbers. array length should not exceed 8
     */
    public async setQueuePriority(wrr: number[]): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'setQueuePriority',
            params: [],
        });
    }

    /**
     * Set strict priority mode for 
     * @param idx Queue index
     */
    public async setStrictPriorityQ(idx: number): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'setStrictPriorityQ',
            params: [],
        });
    }

    /**
     * Get Queue priority
     * 
     * @returns wrr values of the queues
     */
    public async getQueuePriority(): Promise<number[]> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'getQueuePriority',
            params: [],
        }) as number[];
    }

    /**
     * Get number of strict priority Qs
     * @returns Number of strict priority Q
     */
    public async getStrictPriorityQ(): Promise<number> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'getStrictPriorityQ',
            params: [],
        }) as number;
    }

    /**
     * Set DSCP to Q Map
     * @param map DSCP Map
     */
    public async setDSCPMap(map: DSCPMap): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'setDSCPMap',
            params: [map],
        });
    }

    /**
     * Set CoS to Q Map
     * @param map CoS Map
     */
    public async setCoSMap(map: CoSMap): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'setCoSMap',
            params: [map],
        });
    }

    /**
     * Get current DSCP to Q map
     * @returns DSCP map
     */
    public async getDSCPMap(): Promise<DSCPMap> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'getDSCPMap',
            params: [],
        }) as DSCPMap;
    }

    /**
     * Get current CoS to Q map
     * @returns CoS Map
     */
    public async getCoSMap(): Promise<CoSMap> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchQoS',
            method: 'getCoSMap',
            params: [],
        }) as CoSMap;
    }
}
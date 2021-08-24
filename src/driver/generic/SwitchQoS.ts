export interface DSCPMap {[key: number]: number}
export interface CoSMap {[key: number]: number}

export abstract class SwitchQoS {
    public abstract setQueuePriority(wrr: number[]): Promise<void>;
    public abstract setStrictPriorityQ(idx: number): Promise<void>;
    public abstract getQueuePriority(): Promise<number[]>;
    public abstract getStrictPriorityQ(idx: number): Promise<number>;
    public abstract setDSCPMap(map: DSCPMap): Promise<void>;
    public abstract setCoSMap(map: CoSMap): Promise<void>;
    public abstract getDSCPMap(): Promise<DSCPMap>;
    public abstract getCoSMap(): Promise<CoSMap>;
}

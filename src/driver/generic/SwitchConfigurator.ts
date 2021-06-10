import { EthernetPort } from "./EthernetPort";
import { VLAN } from "./VLAN";

export abstract class SwitchConfigurator {
    constructor() {
        //
    }

    public async init(): Promise<void> {
        // Dummy API. Eat up.
    }

    public abstract getSwitchPorts(): Promise<EthernetPort[]>;
    public abstract setSwitchPort(port: EthernetPort, portIdx: number): Promise<void>;

    public abstract getAllVLAN(): Promise<VLAN[]>;
    public abstract getVLAN(vid: number): Promise<VLAN | null>;
    public abstract setVLAN(vlan: VLAN): Promise<void>;
}

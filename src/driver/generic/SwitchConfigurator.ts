import { EthernetPort } from "./EthernetPort";
import { VLAN } from "./VLAN";

export abstract class SwitchConfigurator {
    constructor() {
        //
    }

    public abstract getSwitchPorts(): Promise<EthernetPort[]>;
    public abstract setSwitchPort(port: EthernetPort, portIdx: number): Promise<void>;

    public abstract getAllVLAN(): Promise<VLAN[]>;
    public abstract getVLAN(vid: number): Promise<VLAN>;
    public abstract setVLAN(vlan: VLAN): Promise<void>;
}
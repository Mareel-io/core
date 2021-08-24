import { AxiosInstance } from "axios";
import { EthernetPort } from "../generic/EthernetPort";
import { SwitchConfigurator as GenericSwitchConfigurator } from "../generic/SwitchConfigurator";
import { VLAN } from "../generic/VLAN";

export class SwitchConfigurator extends GenericSwitchConfigurator {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public getSwitchPorts(): Promise<EthernetPort[]> {
        throw new Error("Method not implemented.");
    }

    public setSwitchPort(port: EthernetPort, portIdx: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public getAllVLAN(): Promise<VLAN[]> {
        throw new Error("Method not implemented.");
    }

    public getVLAN(vid: number): Promise<VLAN | null> {
        throw new Error("Method not implemented.");
    }

    public setVLAN(vlan: VLAN): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

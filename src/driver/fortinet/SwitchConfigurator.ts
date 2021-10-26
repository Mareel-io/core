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

    public async getInterfaces(): Promise<void> {
        const apiResult = await this.api.get('/api/v2/cmdb/system/interface');
        //
    }

    public async getSwitchPorts(): Promise<EthernetPort[]> {
        const apiResult = await this.api.get('/api/v2/cmdb/system/virtual-switch');
        throw new Error('WIP');
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

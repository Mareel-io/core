import { EthernetPort } from "./EthernetPort";

export abstract class SwitchConfigurator {
    constructor() {
        //
    }

    public abstract getSwitchPorts(): Promise<EthernetPort[]>;
}
import { EthernetPort } from "./EthernetPort";

export class VLAN {
    protected type: '802.1q' | 'port-based';
    protected members: Map<string, EthernetPort>;

    constructor(type: '802.1q' | 'port-based') {
        this.type = type;
        this.members = new Map();
    }

    public addPortMember(port: EthernetPort): void {
        this.members.set(port.portName, port);
    }

    public removePortMember(port: EthernetPort): void {
        this.members.delete(port.portName);
    }

    public getPortList(): EthernetPort[] {
        const ret: EthernetPort[] = [];
        for (const port of this.members.values()) {
            ret.push(port);
        }

        return ret;
    }
}
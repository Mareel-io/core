import { UnsupportedFeatureError } from "../../error/MarilError";
import { EthernetPort } from "./EthernetPort";

export class VLAN {
    protected members: Map<string, EthernetPort>;
    protected _type: '802.1q' | 'port-based';
    protected _vid: number;

    constructor(type: '802.1q' | 'port-based') {
        this.members = new Map();
        this._type = type;
        this._vid = -1;
    }

    /**
     * Sets 802.1q VLAN vid
     * 
     * @param vid - 802.1q VLAN ID
     */
    public set vid(vid: number) {
        if (this._type === 'port-based') {
            throw new UnsupportedFeatureError(`802.1Q VLAN ID is not supported in VLAN type ${this.type}`);
        }
        this._vid = vid;
    }

    /**
     * Returns 802.1q VLAN vid
     * 
     * @returns 802.1q VLAN ID
     */
    public get vid(): number {
        return this._vid;
    }

    /**
     * Sets VLAN type
     * 
     * @param type - VLAN type
     */
    public set type(type: '802.1q' | 'port-based') {
        this._type = type;
    }

    /**
     * Returns VLAN type
     * 
     * @returns VLAN type
     */
    public get type(): '802.1q' | 'port-based' {
        return this._type;
    }

    /**
     * Add port to given VLAN
     * 
     * @param port - Ethernet port to add
     */
    public addPortMember(port: EthernetPort): void {
        this.members.set(port.portName, port);
    }

    /**
     * Remove port from given VLAN
     * 
     * @param port - Ethernet port to remove
     */
    public removePortMember(port: EthernetPort): void {
        this.members.delete(port.portName);
    }

    /**
     * Return ports currently belongs to VLAN
     * 
     * @returns Array of Ethernet ports belong to current VLAN
     */
    public getPortList(): EthernetPort[] {
        const ret: EthernetPort[] = [];
        for (const port of this.members.values()) {
            ret.push(port);
        }

        return ret;
    }
}
import { UnsupportedFeatureError } from "../../error/MarilError";
import { EthernetPort } from "./EthernetPort";

export class VLAN {
    protected members: {[key: string]: {port: EthernetPort, tag: 'U'|'T'|'PU'|'PT'}};
    protected _type: '802.1q' | 'port-based';
    protected _vid: number;
    public alias = '';

    constructor(type: '802.1q' | 'port-based') {
        this.members = {};
        this._type = type;
        this._vid = -1;
    }

    /**
     * Convert its state into normal k-v pair form.
     * Do not fiddle with this. Not guaranteed to be stable
     * @returns Current state. Do not fiddle with this
     */
    public serialize(): {[key: string]: any} {
        return {
            members: this.members,
            _type: this._type,
            _vid: this._vid,
            alias: this.alias,
        };
    }

    /**
     * Restores its state into object.
     * Do not fiddle with this. Not guaranteed to be stable
     * @param restoreData - state from serialize()
     */
    public restore(restoreData: {[key: string]: any}) {
        this.members = restoreData.members;
        this._type = restoreData._type;
        this._vid = restoreData._vid;
        this.alias = restoreData.alias;
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
    public addPortMember(port: EthernetPort, tag: 'U'|'T'|'PU'|'PT' = 'U'): void {
        this.members[port.portName] = {port, tag};
    }

    /**
     * Remove port from given VLAN
     * 
     * @param port - Ethernet port to remove
     */
    public removePortMember(port: EthernetPort): void {
        delete this.members[port.portName];
    }

    /**
     * Return ports currently belongs to VLAN
     * 
     * @returns Array of Ethernet ports belong to current VLAN
     */
    public getPortList(): {port: EthernetPort, tag: 'U'|'T'|'PU'|'PT'}[] {
        const ret: {port: EthernetPort, tag: 'U'|'T'|'PU'|'PT'}[] = [];
        for (const port of Object.values(this.members)) {
            ret.push(port);
        }

        return ret;
    }
}

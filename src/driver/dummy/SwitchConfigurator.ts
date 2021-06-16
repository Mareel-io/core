import { EthernetPort as DummyEthernetPort } from './EthernetPort';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../generic/SwitchConfigurator';
import { VLAN as DummyVLAN } from './VLAN';
import { EthernetPort } from '../generic/EthernetPort';

export class SwitchConfigurator extends GenericSwitchConfigurator {
    private ethports: DummyEthernetPort[] = [];
    private vlans: DummyVLAN[] = [];

    constructor() {
        super();

        for(let i = 0; i < 100; i++) {
            this.vlans[i] = new DummyVLAN('802.1q');
        }

        for (let i = 0; i < 24; i++) {
            this.ethports[i] = new DummyEthernetPort();
            this.ethports[i].duplex = 'Full';
            this.ethports[i].autoneg = true;
            this.ethports[i].linkSpeed = '1000Mbps';
            this.ethports[i].isActive = true;
        }
    }
    
    public getSwitchPorts(): Promise<DummyEthernetPort[]> {
        throw new Error('Method not implemented.');
    }

    public setSwitchPort(port: DummyEthernetPort, portIdx: number): Promise<void> {
        //
        throw new Error('Method not implemented.');
    }

    public async getAllVLAN(): Promise<DummyVLAN[]> {
        return this.vlans;
    }

    public async getVLAN(vid: number): Promise<DummyVLAN | null> {
        if (this.vlans[vid] == null) {
            return null;
        } else {
            return this.vlans[vid];
        }
    }

    public async setVLAN(vlan: DummyVLAN): Promise<void> {
        this.vlans[vlan.vid] = vlan;
    }
}

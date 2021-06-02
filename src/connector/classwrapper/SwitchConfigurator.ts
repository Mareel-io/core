import { EthernetPort as CiscoEthernetPort } from '../../driver/cisco/EthernetPort';
import { EthernetPort as EFMEthernetPort } from '../../driver/efm/EthernetPort';
import { EthernetPort as GenericEthernetPort } from '../../driver/generic/EthernetPort';
import { VLAN as GenericVLAN } from '../../driver/generic/VLAN';
import { VLAN as CiscoVLAN } from '../../driver/cisco/VLAN';
import { VLAN as EFMVLAN } from '../../driver/efm/VLAN';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../../driver/generic/SwitchConfigurator';
import { RPCProvider } from '../../util/jsonrpcv2';

export class RPCSwitchConfigurator extends GenericSwitchConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getSwitchPorts(): Promise<GenericEthernetPort[]> {
        const ret: {[key: string]: any}[] = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getSwitchPorts',
            params: [],
        });

        return ret.map((stat) => {
            // TODO: FIXME: Depends on the platform, instantiate different EthernetPort obj
            const ethPort = new CiscoEthernetPort();

            ethPort.restore(stat);
            return ethPort;
        });
    }

    public async setSwitchPort(port: GenericEthernetPort, portIdx: number): Promise<void> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'setSwitchPort',
            params: [port.serialize(), portIdx],
        });
    }

    public async getAllVLAN(): Promise<GenericVLAN[]> {
        const ret: {[key: string]: any}[] = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getAllVLAN',
            params: [],
        });

        return ret.map((stat) => {
            // TODO: FIXME: Depends on the platform, instantiate different VLAN obj
            const vlan = new CiscoVLAN('802.1q');
            vlan.restore(stat);

            return vlan;
        });
    }

    public async getVLAN(vid: number): Promise<GenericVLAN | null> {
        const ret: {[key: string]: any} | null = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getVLAN',
            params: [vid],
        });

        if (ret != null) {
            const vlan = new CiscoVLAN('802.1q');
            vlan.restore(ret);
            return vlan;
        } else {
            return null;
        }
    }

    public async setVLAN(vlan: GenericVLAN): Promise<void> {
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getVLAN',
            params: [vlan.serialize()],
        });
    }
}

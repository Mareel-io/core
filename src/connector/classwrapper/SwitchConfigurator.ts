import { EthernetPort } from '../../driver/generic/EthernetPort';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../../driver/generic/SwitchConfigurator';
import { VLAN } from '../../driver/generic/VLAN';
import { RPCProvider } from '../../util/jsonrpcv2';

export class RPCSwitchConfigurator extends GenericSwitchConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getSwitchPorts(): Promise<EthernetPort[]> {
        // TODO: Unwrap EthernetPort from serialized something
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getSwitchPorts',
            params: [],
        });
    }

    public async setSwitchPort(port: EthernetPort, portIdx: number): Promise<void> {
        // TODO: Wrap port into serializable
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'setSwitchPort',
            params: [port, portIdx],
        });
    }

    public async getAllVLAN(): Promise<VLAN[]> {
        // TODO: Unwrap VLAN[] from serialized result
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getAllVLAN',
            params: [],
        });
    }

    public async getVLAN(vid: number): Promise<VLAN | null> {
        // TODO: Unwrap VLAN into serializable something
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getVLAN',
            params: [vid],
        });
    }

    public async setVLAN(vlan: VLAN): Promise<void> {
        // TODO: Wrap VLAN into serializable something
        return await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'SwitchConfigurator',
            method: 'getVLAN',
            params: [vlan],
        });
    }
}

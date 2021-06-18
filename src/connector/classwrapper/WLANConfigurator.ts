import { WLANDevConfiguration } from '../../driver/efm/WLANDevConfiguration';
import { WLANConfigurator } from '../../driver/generic/wlan';
import { WLANIFaceCfg } from '../../driver/generic/WLANIFaceCfg';
import { RPCProvider } from '../jsonrpcv2';

export class RPCWLANConfigurator extends WLANConfigurator {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async getDeviceList(): Promise<string[]> {
        return (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'WLANConfigurator',
            method: 'getDeviceList',
            params: [],
        })) as string[];
    }

    public async getDeviceCfg(devname: string): Promise<WLANDevConfiguration> {
        const res = (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'WLANConfigurator',
            method: 'getDeviceCfg',
            params: [devname],
        }));

        const wldev = new WLANDevConfiguration();
        wldev.restore(res as any);
        return wldev;
    }

    public async setDeviceCfg(devname: string, cfg: WLANDevConfiguration): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'WLANConfigurator',
            method: 'setDeviceCfg',
            params: [devname, cfg.serialize()],
        });
    }

    public async getIFaceCfg(devname: string, ifname: string): Promise<WLANIFaceCfg> {
        const res = (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'WLANConfigurator',
            method: 'getDeviceCfg',
            params: [devname],
        }));

        const wlifcfg = new WLANIFaceCfg();
        wlifcfg.restore(res as any);
        return wlifcfg;
    }

    public async setIFaceCfg(devname: string, ifname: string, cfg: WLANIFaceCfg): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'WLANConfigurator',
            method: 'setDeviceCfg',
            params: [devname, ifname, cfg.serialize()],
        });
    }
}

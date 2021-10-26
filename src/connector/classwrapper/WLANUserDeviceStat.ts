import { User80211Device } from '../../driver/efm/User80211Device';
import { WLANUserDeviceStat } from '../../driver/generic/WLANUserDeviceStat';
import { RPCProvider } from '../jsonrpcv2';

export class RPCWLANUserDeviceStat extends WLANUserDeviceStat {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    /**
     * Get STAs connected to given WLAN interface
     * 
     * @param devname - WLAN device name
     * @param ifname - WLAN interface name
     * @returns List of currently connected STAs
     */
    public async getUserDevices(devname: string, ifname: string): Promise<User80211Device[]> {
        const res = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'WLANUserDeviceStat',
            method: 'getUserDevices',
            params: [devname, ifname],
        });

        return (res as any[]).map((elem) => {
            const ud = new User80211Device();
            ud.restore(elem);
            return ud;
        });
    }
}

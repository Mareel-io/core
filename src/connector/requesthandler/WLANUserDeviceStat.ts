import { WLANUserDeviceStat as GenericWLANUserDeviceStat } from '../../driver/generic/WLANUserDeviceStat';
import { WLANUserDeviceStat as EFMWLANUserDeviceStat } from '../../driver/efm/WLANUserDeviceStat';
import { RPCMethodTable, RPCRequestHandler } from './RPCRequestHandler';

export class WLANUserDeviceStatReqHandler extends RPCRequestHandler {
    private wlanUserDeviceStat: GenericWLANUserDeviceStat | EFMWLANUserDeviceStat;
    protected rpcMethodTable: RPCMethodTable = {
        getUserDevices: async(devname: string, ifname: string): Promise<{[key: string]: any }> => {
            const res = await this.wlanUserDeviceStat.getUserDevices(devname as any, ifname);
            return res.map((elem) => {
                return elem.serialize();
            });
        },
    };

    constructor(deviceId: string, wlanUserDeviceStat: GenericWLANUserDeviceStat | EFMWLANUserDeviceStat) {
        super(deviceId, 'WLANUserDeviceStat');
        this.wlanUserDeviceStat = wlanUserDeviceStat;
    }

    async init(): Promise<void> {
        // TODO: Implement me
    }
}

import { User80211Device } from "./User80211Device"

export abstract class WLANUserDeviceStat {
    constructor() {
        //
    }

    public abstract getUserDevices(devname: string, ifname: string): Promise<[User80211Device]>;
}
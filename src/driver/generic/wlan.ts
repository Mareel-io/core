import { WLANDevConfiguration } from "../efm/WLANDevConfiguration";
import { WLANIFaceCfg } from "./WLANIFaceCfg";

export abstract class WLANConfigurator {
    constructor() {
        //
    }

    abstract getDeviceList(): Promise<string[]>;
    abstract getDeviceCfg(devname: string): Promise<WLANDevConfiguration>;
    abstract setDeviceCfg(devname: string, cfg: WLANDevConfiguration): Promise<void>;
    abstract getIFaceCfg(devname: string, ifname: string): Promise<WLANIFaceCfg>;
    abstract setIFaceCfg(devname: string, ifname: string, cfg: WLANIFaceCfg): Promise<void>;
}
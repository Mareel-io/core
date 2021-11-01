import { WLANDevConfiguration } from "../efm/WLANDevConfiguration";
import { WLANIFaceCfg } from "./WLANIFaceCfg";

export abstract class WLANConfigurator {
    constructor() {
        //
    }

    /**
     * Get WLAN device list
     * 
     * @returns WLAN device name list
     */
    abstract getDeviceList(): Promise<string[]>;
    /**
     * Get WLAN device configuration
     * 
     * @param devname - WLAN device name
     * @returns WLAN device configuration
     */
    abstract getDeviceCfg(devname: string): Promise<WLANDevConfiguration>;
    /**
     * Apply WLAN device configuration to specific WLAN device
     * 
     * @param devname - WLAN device name
     * @param cfg - WLAN device configuration
     */
    abstract setDeviceCfg(devname: string, cfg: WLANDevConfiguration): Promise<void>;
    /**
     * Get specific interface configuration using wlan devname and ifname
     * 
     * @param devname - WLAN device which holds given interface
     * @param ifname - WLAN interface which belongs to given WLAN device
     * @returns WLAN interface configuration
     */
    abstract getIFaceCfg(devname: string, ifname: string): Promise<WLANIFaceCfg>;
    /**
     * Apply given config to given WLAN interface.
     * 
     * @param devname - WLAN device which holds given interface
     * @param ifname - WLAN interface which belongs to given WLAN device
     * @param cfg - WLAN interface configuration
     */
    abstract setIFaceCfg(devname: string, ifname: string, cfg: WLANIFaceCfg): Promise<void>;
}
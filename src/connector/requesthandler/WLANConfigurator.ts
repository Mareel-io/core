import { WLANConfigurator as EFMWlanConfigurator} from "../../driver/efm/wlan";
import { WLANIFaceCfg as EFMWLANIFaceCfg } from "../../driver/efm/WLANIFaceCfg";
import { WLANConfigurator as GenericWLANConfigurator } from "../../driver/generic/wlan";
import { WLANDevConfiguration, WLANDevConfigurationState } from "../../driver/generic/WLANDevConfiguration";
import { WLANIFaceCfg as GenericWLANIFaceCfg, WLANIFaceCfgState } from "../../driver/generic/WLANIFaceCfg";
import { UnsupportedFeatureError } from "../../error/MarilError";
import { RPCReturnType, RPCv2Request } from "../jsonrpcv2";
import { RPCMethodTable, RPCRequestHandler } from "./RPCRequestHandler";

export class WLANConfiguratorReqHandler extends RPCRequestHandler {
    private wlanConfigurator: GenericWLANConfigurator | EFMWlanConfigurator; // TODO: Add Dummy
    protected rpcMethodTable: RPCMethodTable = {
        getDeviceList: async(): Promise<string[]> => {
            return await this.wlanConfigurator.getDeviceList();
        },
        getDeviceCfg: async(devname: string): Promise<WLANDevConfigurationState> => {
            const deviceCfg = await this.wlanConfigurator.getDeviceCfg(devname);
            return deviceCfg.serialize();
        },
        setDeviceCfg: async(devname: string, cfgState: WLANDevConfigurationState): Promise<void> => {
            const cfg = new WLANDevConfiguration();
            cfg.restore(cfgState);
            await this.wlanConfigurator.setDeviceCfg(devname, cfg);
        },
        getIFaceCfg: async(devname: string, ifname: string): Promise<WLANIFaceCfgState> => {
            const cfg = await this.wlanConfigurator.getIFaceCfg(devname, ifname);
            return cfg.serialize();
        },
        setIFaceCfg: async(devname: string, ifname: string, cfgStat: WLANIFaceCfgState): Promise<void> => {
            if (this.wlanConfigurator instanceof EFMWlanConfigurator) {
                const cfg = new EFMWLANIFaceCfg();
                cfg.restore(cfgStat);
                await this.wlanConfigurator.setIFaceCfg(devname, ifname, cfg);
            } else {
                const cfg = new GenericWLANIFaceCfg();
                cfg.restore(cfgStat);
                await this.wlanConfigurator.setIFaceCfg(devname, ifname, cfg);
            }
        },
        setIFaceMACAuthMode: async(devname: string, ifname: string, mode: string): Promise<void> => {
            if (this.wlanConfigurator instanceof EFMWlanConfigurator) {
                return await this.wlanConfigurator.setIFaceMACAuthMode(devname, ifname, mode as any);
            } else {
                throw new UnsupportedFeatureError('This feature is not supported.');
            }
        },
        setIFaceMACAuthDevice: async(devname: string, ifname: string, device: {macaddr: string, name: string}): Promise<void> => {
            if (this.wlanConfigurator instanceof EFMWlanConfigurator) {
                return await this.wlanConfigurator.setIFaceMACAuthDevice(devname, ifname, device);
            } else {
                throw new UnsupportedFeatureError('This feature is not supported.');
            }
        },
        getIFaceMACAuthMode: async(devname: string, ifname: string): Promise<string> => {
            if (this.wlanConfigurator instanceof EFMWlanConfigurator) {
                return await this.wlanConfigurator.getIFaceMACAuthMode(devname, ifname);
            } else {
                throw new UnsupportedFeatureError('This feature is not supported.');
            }
        },
        getIFaceMACAuthList: async(devname: string, ifname: string): Promise<{[key: string]: string}[]> => {
            if (this.wlanConfigurator instanceof EFMWlanConfigurator) {
                return await this.wlanConfigurator.getIFaceMACAuthList(devname, ifname);
            } else {
                throw new UnsupportedFeatureError('This feature is not supported.');
            }
        },
        removeIFaceMACAuthDevice: async(devname: string, ifname: string, macaddr: string): Promise<void> => {
            if (this.wlanConfigurator instanceof EFMWlanConfigurator) {
                return await this.wlanConfigurator.removeIFaceMACAuthDevice(devname, ifname, macaddr);
            } else {
                throw new UnsupportedFeatureError('This feature is not supported.');
            }
        },
    }
    
    constructor(deviceId: string, wlanConfigurator: GenericWLANConfigurator | EFMWlanConfigurator) {
        super(deviceId, 'WLANConfigurator');
        this.wlanConfigurator = wlanConfigurator;
    }

    public async init(): Promise<void> {
        // TODO
    }
}
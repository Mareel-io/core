import { WLANConfigurator as EFMWlanConfigurator} from "../../../driver/efm/wlan";
import { WLANConfigurator as GenericWLANConfigurator } from "../../../driver/generic/wlan";
import { RPCReturnType, RPCv2Request } from "../../jsonrpcv2";
import { RPCMethodTable, RPCRequestHandler } from "../RPCRequestHandler";

export class WLANConfiguratorReqHandler extends RPCRequestHandler {
    private wlanConfigurator: GenericWLANConfigurator | EFMWlanConfigurator; // TODO: Add Dummy
    protected rpcMethodTable: RPCMethodTable = {
        getDeviceList: async() => {
            //
        },
        getDeviceCfg: async() => {
            //
        },
        setDeviceCfg: async() => {
            //
        },
        getIFaceCfg: async() => {
            //
        },
        setIFaceCfg: async() => {
            //
        },
        setIFaceMACAuthMode: async() => {
            //
        },
        setIFaceMACAuthDevice: async() => {
            //
        },
        getIFaceMACAuthMode: async() => {
            //
        },
        getIFaceMACAuthList: async() => {
            //
        },
        removeIFaceMACAuthDevice: async() => {
            //
        },
    }
    
    constructor(deviceId: string, wlanConfigurator: GenericWLANConfigurator | EFMWlanConfigurator) {
        super(deviceId);
        this.wlanConfigurator = wlanConfigurator;
    }

    public async init(): Promise<void> {
        // TODO
    }
}
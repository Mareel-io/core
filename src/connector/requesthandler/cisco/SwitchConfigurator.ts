import { SwitchConfigurator as CiscoSwitchConfigurator } from '../../../driver/cisco/SwitchConfigurator';
import { EthernetPort } from '../../../driver/cisco/EthernetPort';
import { MethodNotAvailableError, RPCReturnType, RPCv2Request, RPCv2Response } from '../../jsonrpcv2';
import { VLAN } from '../../../driver/cisco/VLAN';

export class SwitchConfiguratorReqHandler {
    private deviceId: string;
    private switchConfigurator: CiscoSwitchConfigurator;
    private rpcMethodTable: {[key: string]: (...args: any) => Promise<any> } = {
        loadConfig: async (): Promise<void> => {
            await this.switchConfigurator.loadConfig();
        },
        getSwitchPorts: async () => {
            const switchPorts = await this.switchConfigurator.getSwitchPorts();
            return switchPorts.map((elem) => {
                return elem.serialize();
            });
        },
        setSwtichPort: async (port: {[key: string]: any}, portIdx: number) => {
            const ethernetPort = new EthernetPort();
            ethernetPort.restore(port);
            return await this.switchConfigurator.setSwitchPort(ethernetPort, portIdx);
        },
        getAllVLAN: async () => {
            const vlans = await this.switchConfigurator.getAllVLAN();
            return vlans.map((elem) => {
                return elem.serialize();
            });
        },
        getVLAN: async (vid: number) => {
            const vlan = await this.switchConfigurator.getVLAN(vid);
            if (vlan == null) return null;
            return vlan.serialize();
        },
        setVLAN: async (vlan: {[key: string]: any}) => {
            const vlanObj = new VLAN('802.1q');
            vlanObj.restore(vlan);
            return await this.switchConfigurator.setVLAN(vlanObj);
        },
    };

    constructor(deviceId: string, switchConfigurator: CiscoSwitchConfigurator) {
        this.deviceId = deviceId;
        this.switchConfigurator = switchConfigurator;
    }

    async init(): Promise<void> {
        await this.switchConfigurator.init();
    }

    /**
     * Get RPC handler callback for RPC
     * @returns RPC Handler callback function
     */
    public getRPCHandler(): (req: RPCv2Request) => Promise<RPCReturnType<any>> {
        return async (req: RPCv2Request) => {
            if (req.target != this.deviceId) {
                return {handled: false, result: null};
            }

            return await this.handleRPCRequest(req);
        };
    }

    private async handleRPCRequest(req: RPCv2Request): Promise<RPCReturnType<any>> {
        const cb = this.rpcMethodTable[req.method];
        if (cb == null) {
            return {handled: false, result: null};
        }

        if (!(req.params instanceof Array)) {
            throw new Error('K-V pair method calling is not supported yet');
        }

        const ret = await cb(...req.params);
        console.log(ret);
        return {handled: true, result: ret};
    }
}

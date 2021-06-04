import { SwitchConfigurator as CiscoSwitchConfigurator } from '../../../driver/cisco/SwitchConfigurator';
import { EthernetPort } from '../../../driver/cisco/EthernetPort';
import { MethodNotAvailableError, RPCv2Request, RPCv2Response } from '../../jsonrpcv2';
import { VLAN } from '../../../driver/cisco/VLAN';

export class SwitchConfiguratorReqHandler {
    private deviceId: string;
    private switchConfigurator: CiscoSwitchConfigurator;
    private rpcMethodTable: {[key: string]: (...args: any) => Promise<any> } = {
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

    /**
     * Get RPC handler callback for RPC
     * @returns RPC Handler callback function
     */
    public getRPCHandler(): (req: RPCv2Request) => Promise<any> {
        return async (req: RPCv2Request) => {
            if (req.target != this.deviceId) {
                throw new MethodNotAvailableError('Different DeviceID');
            }

            return this.handleRPCRequest(req);
        };
    }

    private async handleRPCRequest(req: RPCv2Request): Promise<any> {
        const cb = this.rpcMethodTable[req.method];
        if (cb == null) {
            throw new MethodNotAvailableError('Method not exist');
        }

        if (!(req.params instanceof Array)) {
            throw new Error('K-V pair method calling is not supported yet');
        }

        return cb(req.params);
    }
}

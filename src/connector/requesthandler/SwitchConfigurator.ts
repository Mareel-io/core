import { SwitchConfigurator as GenericSwitchConfigurator } from '../../driver/generic/SwitchConfigurator';
import { SwitchConfigurator as CiscoSwitchConfigurator } from '../../driver/cisco/SwitchConfigurator';
import { SwitchConfigurator as DummySwitchConfigurator } from '../../driver/dummy/SwitchConfigurator';
import { EthernetPort } from '../../driver/cisco/EthernetPort';
import { MethodNotAvailableError, RPCReturnType, RPCv2Request, RPCv2Response } from '../jsonrpcv2';
import { VLAN } from '../../driver/cisco/VLAN';
import { RPCMethodTable, RPCRequestHandler } from './RPCRequestHandler';

export class SwitchConfiguratorReqHandler extends RPCRequestHandler {
    private switchConfigurator: GenericSwitchConfigurator | CiscoSwitchConfigurator | DummySwitchConfigurator;
    protected rpcMethodTable: RPCMethodTable = {
        loadConfig: async (): Promise<void> => {
            if (this.switchConfigurator instanceof CiscoSwitchConfigurator) {
                await this.switchConfigurator.loadConfig();
            } else {
                return;
            }
        },
        applyConfig: async (): Promise<void> => {
            if (this.switchConfigurator instanceof CiscoSwitchConfigurator) {
                await this.switchConfigurator.applyConfig();
            } else {
                return;
            }
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

    constructor(deviceId: string, switchConfigurator: GenericSwitchConfigurator | CiscoSwitchConfigurator | DummySwitchConfigurator) {
        super(deviceId, 'SwitchConfigurator');
        this.switchConfigurator = switchConfigurator;
    }

    async init(): Promise<void> {
        await this.switchConfigurator.init();
    }
}

import { UnsupportedFeatureError } from '../../error/MarilError';
import { VLAN as GenericVLAN } from '../generic/VLAN';

export class VLAN extends GenericVLAN {
    constructor(type: '802.1q' | 'port-based') {
        super(type);

        if (type === '802.1q') {
            throw new UnsupportedFeatureError(`ipTIME does not support given VLAN type: ${type}`);
        }
    }

    public set type(type: '802.1q' | 'port-based') {
        if (type === '802.1q') {
            throw new UnsupportedFeatureError(`ipTIME does not support given VLAN type: ${type}`);
        }

        this._type = type;
    }
}
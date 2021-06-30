import { UnsupportedFeatureError } from '../../error/MarilError';
import { WLANIFaceCfg as GenricWLANIFaceCfg } from '../generic/WLANIFaceCfg';

export class WLANIFaceCfg extends GenricWLANIFaceCfg {
    /**
     * Please, do not use this in your code. EFM specific wlan security descriptor generator.
     */
    public get encryption_efm(): string {
        const method = this.encryption;
        const list = method.split('+');
        const cipher = list.slice(1).join('+');
        let personallist = '';

        switch(list[0]) {
            case 'sae':
            case 'sae-mixed':
                // WPA3 support WIP
                throw new UnsupportedFeatureError('Not support WPA3 yet...');
                break;
            case 'psk':
                personallist = 'wpapsk';
                break;
            case 'psk-mixed':
                personallist = 'wpapskwpa2psk';
                break;
            case 'psk2':
                personallist = 'wpa2psk';
                break;
            case '':
                personallist = 'nouse';
                break;
            default:
                throw new UnsupportedFeatureError(`Not supported feature: ${list[0]}`);
                break;
        }

        switch(cipher) {
            case 'tkip+ccmp':
            case 'tkip+aes':
                personallist += '_tkipaes';
                break;
            case 'ccmp':
            case 'aes':
                personallist += '_aes';
                break;
            case 'tkip':
                personallist += '_tkip';
                break;
        }

        return personallist;
    }

    /**
     * Please, do not use this in your code. EFM specific wlan security descriptor decoder.
     */
    public set encryption_efm(personallist: string) {
        const list = personallist.split('_');
        let encryption = '';

        switch(list[0]) {
            case 'wpa2psk':
                encryption = 'psk2';
                break;
            case 'wpapsk':
                encryption = 'psk';
                break;
            case 'wpapskwpa2psk':
                encryption = 'psk-mixed';
                break;
            case 'nouse':
                encryption = '';
                break;
            default:
                throw new UnsupportedFeatureError(`Not supported feature: ${list[0]}`);
                break;
        }

        switch(list[1]) {
            case 'aes':
                encryption += '+ccmp';
                break;
            case 'tkipaes':
                encryption += '+tkip+ccmp';
                break;
            case 'tkip':
                encryption += '+tkip';
                break;
            case null:
            case undefined:
                // Do nothing
                break;
            default:
                throw new UnsupportedFeatureError(`Not supported feature: ${list[1]}`);
                break;
        }

        this.encryption = encryption;
    }
}
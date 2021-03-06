import { EthernetPort as GenericEthernetPort } from '../generic/EthernetPort';

export class EthernetPort extends GenericEthernetPort {
    /**
     * EFM-specific taglabel generator
     */
    public get tagLabel(): string {
        if (this.tag === 1) {
            return 'WAN';
        } else if (this.tag === 2) {
            return 'LAN';
        } else {
            return 'UNSUPPORTED';
        }
    }
}
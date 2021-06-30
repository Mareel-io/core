import { MethodNotImplementedError } from '../../error/MarilError';
import { EthernetPort as GenericEthernetPort } from '../generic/EthernetPort';

export class EthernetPort extends GenericEthernetPort {
    constructor() {
        super();
    }

    public get tagLabel(): string {
        throw new MethodNotImplementedError();
    }
}
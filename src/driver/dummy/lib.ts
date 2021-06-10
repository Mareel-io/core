import { ControllerFactory as GenericControllerFactory } from '../generic/lib';
import { SwitchConfigurator as DummySwitchConfigurator } from './SwitchConfigurator';

export class ControllerFactory extends GenericControllerFactory {
    constructor(deviceaddress: string = 'nowhere') {
        super(deviceaddress);
    }

    async authenticate(credential: any): Promise<void> {
        console.log('DummyControllerFactory: Auth OK');
    }

    public getSwitchConfigurator(): DummySwitchConfigurator {
        return new DummySwitchConfigurator();
    }
}
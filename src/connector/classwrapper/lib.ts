import { GenericControllerFactory } from "../..";
import { RPCSwitchConfigurator } from "./SwitchConfigurator";

export class RPCControllerFactory extends GenericControllerFactory {
    authenticate(credential: any): Promise<void> {
        throw new Error("You do not have to authenticate here");
    }

    getSwitchConfigurator() {
        // TODO: Implement me.
    }
}
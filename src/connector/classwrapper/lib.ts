import { GenericControllerFactory } from "../..";

export class RPCControllerFactory extends GenericControllerFactory {
    authenticate(credential: any): Promise<void> {
        throw new Error("You do not have to authenticate here");
    }
}
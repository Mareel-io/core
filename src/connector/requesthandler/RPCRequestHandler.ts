import { RPCReturnType, RPCv2Request } from "../jsonrpcv2";

export interface RPCMethodTable {
    [key: string]: (...args: any) => Promise<any>
}

export abstract class RPCRequestHandler {
    protected deviceId: string;
    protected rpcMethodTable: RPCMethodTable = {};

    constructor(deviceId: string) {
        this.deviceId = deviceId;
    }

    public abstract init(): Promise<void>;

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
        console.log(cb);
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
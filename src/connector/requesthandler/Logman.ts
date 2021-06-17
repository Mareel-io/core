import { Logman as EFMLogman } from '../../driver/efm/Logman';
import { Logman as GenericLogman } from '../../driver/generic/Logman';
import { RPCMethodTable, RPCRequestHandler } from './RPCRequestHandler';

export class LogmanReqHandler extends RPCRequestHandler {
    private logman: GenericLogman | EFMLogman;
    protected rpcMethodTable: RPCMethodTable = {
    };

    constructor(deviceId: string, logman: GenericLogman | EFMLogman) {
        super(deviceId);
        this.logman = logman;
    }

    async init(): Promise<void> {
    }
}

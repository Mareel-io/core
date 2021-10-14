import { Logman as EFMLogman } from '../../driver/efm/Logman';
import { Logman as GenericLogman } from '../../driver/generic/Logman';
import { Logman as CiscoLogman } from '../../driver/cisco/Logman';
import { RPCMethodTable, RPCRequestHandler } from './RPCRequestHandler';

export class LogmanReqHandler extends RPCRequestHandler {
    private logman: GenericLogman | EFMLogman | CiscoLogman;
    protected rpcMethodTable: RPCMethodTable = {
        getAvailableSources: async(): Promise<string[]> => {
            return await this.logman.getAvailableSources();
        },
        queryLog: async(source: string, from: string | null, to: string | null) => {
            const fromTS = from ? new Date(from) : undefined;
            const toTS = to ? new Date(to) : undefined;
            const logEntries = await this.logman.queryLog(source, fromTS, toTS);

            return logEntries.map((elem) => {
                return elem.serialize();
            });
        },
    };

    constructor(deviceId: string, logman: GenericLogman | EFMLogman | CiscoLogman) {
        super(deviceId, 'Logman');
        this.logman = logman;
    }

    async init(): Promise<void> {
        // TODO: Implement me
    }
}
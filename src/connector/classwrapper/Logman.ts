import { LogEntry, Logman as GenericLogman } from '../../driver/generic/Logman';
import { RPCProvider } from '../jsonrpcv2';

export class RPCLogman extends GenericLogman {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    /**
     * Return available log sources in platform
     * 
     * @returns available log sources
     */
    public async getAvailableSources(): Promise<string[]> {
        const result = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'Logman',
            method: 'getAvailableSources',
            params: [],
        }) as string[];

        return result;
    }

    /**
     * Retrieve log from target
     * 
     * @param source - Log source. Depend on target
     * @param from - Log start date
     * @param to - Log end date
     * @returns Log entries
     */
    public async queryLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]> {
        const result = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'Logman',
            method: 'queryLog',
            params: [source, from, to],
        }, 600000) as {[key: string]: string}[];

        return result.map((ent): LogEntry => {
            const ln = new LogEntry(new Date(), '');
            ln.restore(ent);
            return ln;
        });
    }
}

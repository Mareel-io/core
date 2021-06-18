import { LogEntry, Logman as GenericLogman } from '../../driver/generic/Logman';
import { RPCProvider } from '../jsonrpcv2';

export class RPCSwitchConfigurator extends GenericLogman {
    private rpc: RPCProvider;
    private targetId: string;

    constructor(rpc: RPCProvider, targetId: string) {
        super();

        this.rpc = rpc;
        this.targetId = targetId;
    }

    public async queryLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]> {
        const result = await this.rpc.remoteCall({
            jsonrpc: '2.0',
            target: this.targetId,
            class: 'Logman',
            method: 'queryLog',
            params: [source, from, to],
        }) as {[key: string]: string}[];

        return result.map((ent): LogEntry => {
            const ln = new LogEntry(new Date(), '');
            ln.restore(ent);
            return ln;
        });
    }
}

import { MsgpackRPC } from '../../../util/msgpack-rpc';
import { CoSMap, DSCPMap } from '../../generic/SwitchQoS';

export type CiscoPort = {
    portNo: number,
    pvid: number,
    mode?: string,
    allowedList?: number[],
    taggedList?: number[],
}
export class CiscoConfigEditor extends MsgpackRPC {
    constructor(port: number) {
        super(port);
    }

    private convertCiscoList(list: string[]): number[] {
        const ret: number[] = [];
        for(const elem of list) {
            if (elem.match(/[0-9]*-[0-9]*/)) {
                const [start, end] = elem.split('-').map((elem) => parseInt(elem));
                for (let i = start; i <= end; i++) {
                    ret.push(i);
                }
            } else {
                ret.push(parseInt(elem, 10));
            }
        }

        return ret;
    }
   
    public async ping(): Promise<void> {
        return await this.runRPCCommand('ping');
    }

    public async loadCfg(configfile: string): Promise<void> {
        return await this.runRPCCommand('loadCfg', configfile);
    }

    public async extractCfg(): Promise<string> {
        return await this.runRPCCommand('extractCfg');
    }

    public async getVLANRange(): Promise<number[]> {
        return this.convertCiscoList(await this.runRPCCommand('getVLANRange'));
    }

    // Need to add regex filter to it
    public async defineVLANRange(vlanList: (number|string)[]): Promise<void> {
        return await this.runRPCCommand('defineVLANRange', vlanList);
    }

    public async setVLANName(tagNo: string, name: string): Promise<void> {
        return await this.runRPCCommand('setVLANName',tagNo, name);
    }

    public async getVLANs(): Promise<{tagNo: number, name?: string}[]> {
        return await this.runRPCCommand('getVLANs');
    }

    // TODO: Fix strings to number
    public async getPorts(): Promise<CiscoPort[]> {
        const ret: CiscoPort[] = [];
        const ports: {
            portNo: number,
            pvid: number,
            mode?: string,
            allowedList?: string[],
            taggedList?: string[],
        }[] = await this.runRPCCommand('getPorts');

        for(const port of ports) {
            const elem: {
                portNo: number,
                pvid: number,
                mode?: string,
                allowedList?: (number|string)[],
                taggedList?: (number|string)[],
            } = port;
            if (port.allowedList != null) {
                elem.allowedList = this.convertCiscoList(port.allowedList);
            }

            if (port.taggedList != null) {
                elem.taggedList = this.convertCiscoList(port.taggedList);
            }

            ret.push(elem as CiscoPort);
        }

        return ret;
    }

    public async setPortVLAN(portNo: number, pvid: number, taggedList: (number|string)[] | undefined, allowedList: (number|string)[] | undefined): Promise<void> {
        return await this.runRPCCommand('setPortVLAN', portNo, pvid, taggedList, allowedList);
    }

    public async getDSCPMap(): Promise<DSCPMap> {
        return await this.runRPCCommand('getDCSPMap');
    }

    public async setDSCPMap(map: DSCPMap): Promise<void> {
        return await this.runRPCCommand('setDCSPMap', map);
    }

    public async getCoSMap(): Promise<CoSMap> {
        return await this.runRPCCommand('getCoSMap');
    }

    public async setCoSMap(map: CoSMap): Promise<void> {
        return await this.runRPCCommand('setCoSMap', map);
    }

    public async getQueuePriority(): Promise<number[]> {
        return await this.runRPCCommand('getQueuePriority');
    }

    public async setQueuePriority(prio: number[]): Promise<void> {
        return await this.runRPCCommand('setQueuePriority', prio);
    }

    public async getStrictPriorityQ(): Promise<number> {
        return await this.runRPCCommand('getStrictPriorityQ');
    }

    public async setStrictPriorityQ(prio: number): Promise<void> {
        return await this.runRPCCommand('setStrictPriorityQ', prio);
    }
}

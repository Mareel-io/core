import { MsgpackRPC } from '../../../util/msgpack-rpc';

export class CiscoConfigEditor extends MsgpackRPC {
    constructor() {
        super('./ciscocfg/launcher.sh');
    }

    public async loadCfg(configfile: string): Promise<void> {
        return await this.runRPCCommand('loadCfg', configfile);
    }

    public async extractCfg(): Promise<string> {
        return await this.runRPCCommand('extractCfg');
    }

    // Need to add regex filter to it
    public async defineVLANRange(vlanList: (number|string)[]): Promise<void> {
        return await this.runRPCCommand('defineVLANRange', vlanList);
    }

    public async setVLANName(tagNo: string, name: string): Promise<void> {
        return await this.runRPCCommand('setVLANName',tagNo, name);
    }

    public async getVLANs(): Promise<{tagNo: string}[]> {
        return await this.runRPCCommand('getVLANs');
    }

    // TODO: Fix strings to number
    public async getPorts(): Promise<{portNo: string, pvid: string, mode: string, allowedList: string[], taggedList: string[]}[]> {
        return await this.runRPCCommand('getPorts');
    }

    public async setPortVLAN(portNo: number, pvid: number, taggedList: (number|string)[], allowedList: (number|string)[]): Promise<void> {
        return await this.runRPCCommand('setPortVLAN', portNo, pvid, taggedList, allowedList);
    }
}
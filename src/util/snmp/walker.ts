import snmp from 'net-snmp';
import { MIBLoader } from './mibloader';

interface SNMPConfig {
    id: string,
    authProtocol: undefined | null | 'sha' | 'md5',
    authKey: undefined | null | string,
    privacyProtocol: undefined | null | 'des' | 'aes',
    privatcyKey: undefined | null | string,
};

export class SNMPWalker {
    private cfg: SNMPConfig;
    private mibLoader: MIBLoader;
    private snmpSession: any;
    private target: string;

    constructor(target: string, cfg: SNMPConfig, mibLoader: MIBLoader) {
        this.cfg = cfg;
        this.mibLoader = mibLoader;
        this.target = target;
    }

    connect() {
        // TODO: Find way to translate SNMPconfig to API
        snmp.createV3Session(this.target, {
            name: this.cfg.id,
        });
    }
}
import snmp from 'net-snmp';
import { MIBLoader } from './mibloader';

export interface SNMPClientConfig {
    id: string,
    authProtocol: undefined | null | 'sha' | 'md5',
    authKey: undefined | null | string,
    privacyProtocol: undefined | null | 'des' | 'aes',
    privatcyKey: undefined | null | string,
};

export interface SNMPResult {
    oid: string,
    oidArr: number[],
    type: string,
    value: number | string | Buffer,
};

export class SNMPClient {
    private cfg: SNMPClientConfig;
    private mibLoader: MIBLoader;
    private snmpSession: SNMPSession | undefined;
    private target: string;

    constructor(target: string, cfg: SNMPClientConfig, mibLoader: MIBLoader) {
        this.cfg = cfg;
        this.mibLoader = mibLoader;
        this.target = target;
    }

    public connect() {
        let level = snmp.SecurityLevel.noAuthNoPriv;
        let authProtocol = null;
        let privProtocol = null;

        if (this.cfg.authProtocol != null) {
            if (this.cfg.privacyProtocol != null) {
                level = snmp.SecurityLevel.authPriv;
            } else {
                level = snmp.SecurityLevel.authNoPriv;
            }
        }

        switch(this.cfg.authProtocol) {
            case 'sha':
                authProtocol = snmp.AuthProtocols.sha;
                break;
        }

        switch(this.cfg.privacyProtocol) {
            case 'des':
                privProtocol = snmp.PrivProtocols.des;
                break;
        }

        this.snmpSession = snmp.createV3Session(this.target, {
            name: this.cfg.id,
            level: level,
            authProtocol: authProtocol,
            authKey: this.cfg.authKey,
            privProtocol: privProtocol,
            privKey: this.cfg.privatcyKey,
        });
    }

    public async get(oid: string): Promise<number | string | Buffer> {
        return new Promise((ful, rej) => {
            this.snmpSession?.get([oid], (err, val) => {
                if (err == null) {
                    ful(val);
                } else {
                    rej(err);
                }
            });
        });
    }

    public async walk(oid: string, depth: number): Promise<SNMPResult[]> {
        const valuePairs: SNMPResult[] = [];
        return new Promise((ful, rej) => {
            this.snmpSession?.walk(oid, depth, (varbinds) => {
                varbinds.forEach((elem) => {
                    valuePairs.push({
                        oid: elem.oid,
                        oidArr: elem.oid.split('.').map(elem => parseInt(elem, 10)),
                        type: snmp.ObjectType[elem.type],
                        value: elem.value,
                    });
                });
            }, (e: Error) => {
                if (e != null) {
                    rej(e);
                } else {
                    ful(valuePairs);
                }
            });
        });
    }
}
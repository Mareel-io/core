import snmp from 'net-snmp';
import { MarilError } from '../../error/MarilError';
import { MIBLoader } from './mibloader';

export interface SNMPClientConfig {
    id: string,
    authProtocol: undefined | null | 'sha' | 'md5',
    authKey: undefined | null | string,
    privacyProtocol: undefined | null | 'des' | 'aes',
    privacyKey: undefined | null | string,
}

export interface SNMPResult {
    oid: string,
    oidIRI: string,
    type: string,
    value: number | string | Buffer,
}

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
            case undefined:
            case null:
                break;
            case 'sha':
                authProtocol = snmp.AuthProtocols.sha;
                break;
            default:
                throw new MarilError(`Unknown auth protocol: ${this.cfg.authProtocol}`);
        }

        switch(this.cfg.privacyProtocol) {
            case undefined:
            case null:
                break;
            case 'des':
                privProtocol = snmp.PrivProtocols.des;
                break;
            case 'aes':
                privProtocol = snmp.PrivProtocols.aes;
                break;
            default:
                throw new MarilError(`Unknown privacy protocol: ${this.cfg.authProtocol}`);
        }

        this.snmpSession = snmp.createV3Session(this.target, {
            name: this.cfg.id,
            level: level,
            authProtocol: authProtocol,
            authKey: this.cfg.authKey,
            privProtocol: privProtocol,
            privKey: this.cfg.privacyKey,
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

    public async subtree(oid: string, depth: number): Promise<SNMPResult[]> {
        const valuePairs: SNMPResult[] = [];
        return new Promise((ful, rej) => {
            this.snmpSession?.subtree(oid, depth, (varbinds) => {
                varbinds.forEach((elem) => {
                    valuePairs.push({
                        oid: elem.oid,
                        oidIRI: this.mibLoader.resolveOID(elem.oid),
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

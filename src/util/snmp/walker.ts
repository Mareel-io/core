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

    public connect() {
        // TODO: Find way to translate SNMPconfig to createV3Session API
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

    public async walk(oid: string, depth: number): Promise<{oid: string, value: any}[]> {
        const valuePairs: {oid: string, value: any}[] = [];
        return new Promise((ful, rej) => {
            this.snmpSession.walk(oid, depth, (varbinds: {oid: string, value: any}[]) => {
                varbinds.forEach((elem) => {
                    valuePairs.push({
                        oid: elem.oid,
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
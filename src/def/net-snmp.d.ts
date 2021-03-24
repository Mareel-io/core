// TODO: Remove all the ANY

interface SNMPSession {
    get: (oids: string[], cb: (err: Error, val: any) => any) => void,
    walk: (oid: string, depth: number, walkcb: (varbinds: {oid: string, value: any}[]) => void, cb: (err: Error) => void) => void,
};

declare module 'net-snmp' {
    const AuthProtocols: {
        none: number,
        md5: number,
        sha: number,
        [key: number]: string,
    };
    const PrivProtocols: {
        none: number,
        des: number,
        aes: number,
        aes256b: number,
        aes256r: number,
        [key: number]: string,
    };
    const SecurityLevel: {
        noAuthNoPriv: number,
        authNoPriv: number,
        authPriv: number,
        [key: number]: string,
    };
    function createV3Session(target: string, cfg: any): SNMPSession;
}
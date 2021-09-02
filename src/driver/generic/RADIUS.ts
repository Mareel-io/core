export interface RADIUS {
    server: string,
    key: string,
}

export interface RADIUSAuthMethod {
    tunnel?: string,
    method: 'pap' | 'chap' | 'mschap' | 'mschapv2' | 'unknown',
}
import {promises as fs} from 'fs';

interface oidtreeElement {
    trace: number[],
    module: string | null,
    symbol: string | null,
    [key:number]: oidtreeElement,
}

export class MIBLoader {
    private mibjson: {
        version: string,
        mibEntries: {
            file: string,
            name: string, // TODO: Rename me to module
            symbols: {
                oid: string,
                symbol: string,
                type: string,
            }[],
        }[],
    } = {version: '0.0.0', mibEntries: []};

    private oidtree: oidtreeElement = {} as oidtreeElement;
    private oidmap: {
        [key: string]: {
            module: string,
            fullSymbol: string,
            type: string,
        },
    } = {};

    private symmap: {
        [key: string]: {
            module: string,
            symbol: string,
            oid: string,
        },
    } = {};

    private file: string;

    constructor(file: string) {
        this.file = file;
    }

    public async init(): Promise<void> {
        const file = this.file;
        const json = await fs.readFile(file);
        this.mibjson = JSON.parse(json.toString('utf-8'));
        const entries = this.mibjson.mibEntries;

        for (const ent of entries) {
            for (const sym of ent.symbols) {
                if (this.oidmap[sym.oid] != null) {
                    console.warn(`OID COLLISION! ${sym.oid} ${ent.name}:${sym.symbol} with ${this.oidmap[sym.oid].fullSymbol}`);
                }
    
                if (this.symmap[`${ent.name}:${sym.symbol}`] != null) {
                    console.warn(`SYMBOL COLLISION! ${ent.name}:${sym.symbol}`);
                }

                if (sym.oid == null) {
                    console.warn(`WARN: Symbol ${ent.name}:${sym} does not have OID`)
                    continue;
                }

                const oid = sym.oid.split('.').map((elem) => parseInt(elem, 10));
                const oidEnt = oid.reduce((acc, val, idx) => {
                    if (acc[val] == undefined) {
                        acc[val] = {
                            trace: oid.slice(0, idx + 1),
                            module: null,
                            symbol: null,
                        };
                    }
    
                    return acc[val];
                }, this.oidtree);
    
                oidEnt.trace = oid;
                oidEnt.module = ent.name;
                oidEnt.symbol = sym.symbol;
    
                this.oidmap[sym.oid] = {
                    module: ent.name,
                    fullSymbol: `${ent.name}:${sym.symbol}`,
                    type: sym.type,
                };
    
                this.symmap[`${ent.name}:${sym.symbol}`] = {
                    module: ent.name,
                    symbol: sym.symbol,
                    oid: sym.oid,
                };
            }
        }
    }

    public resolveOID(oid: string): string {
        const oidArr = oid.split('.').map((elem) => parseInt(elem, 10));
        let tmp = this.oidtree;
        let acc = '';
        for(let i = 0; i < oid.length; i++) {
            if (tmp != undefined) {
                tmp = tmp[oidArr[i]];
            }
            if (tmp == undefined) {
                acc += `.[${oidArr[i]}]`;
                continue;
            }
            if (tmp.symbol != null) {
                acc += `.${tmp.symbol}`;
            } else {
                acc += `.[${oidArr[i]}]`;
            }
        }

        return acc;
    }

    public lookupOIDBySymbol(symbol: string, module: ?string): string {
        if (module == null) {
            //
        } else {
            //
        }
    }
}
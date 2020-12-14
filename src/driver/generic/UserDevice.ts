const oui = require('oui');

export abstract class UserDevice {
    protected _macaddr: string = '';
    protected _vendor: string = 'Invalid MAC';
    public uptime: number = 0; // in seconds
    constructor() {
        //
    }

    public get macaddr(): string {
        return this._macaddr;
    }

    public set macaddr(value: string) {
        const chk = value.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/);
        if (chk == null) {
            throw new Error('Invalid MAC address');
        }

        const vendor: string | null = oui(this._macaddr);
        if (vendor == null) {
            this._vendor = 'Unknown vendor';
        } else {
            this._vendor = vendor.split('\n')[0];
        }
        this._macaddr = value;
    }

    public get vendor(): string {
        return this._vendor;
    }
}
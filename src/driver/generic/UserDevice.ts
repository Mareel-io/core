// FIXME: Create typedef for OUI pkg
//eslint-disable-next-line @typescript-eslint/no-var-requires
const oui = require('oui');

export abstract class UserDevice {
    protected _macaddr = '';
    protected _vendor = 'Invalid MAC';
    public uptime = 0; // in seconds
    constructor() {
        //
    }

    /**
     * Convert its state into normal k-v pair form.
     * Do not fiddle with this. Not guaranteed to be stable
     * @returns Current state. Do not fiddle with this
     */
    public serialize(): {[key: string]: any} {
        return { 
            _macaddr: this._macaddr,
            _vendor: this._vendor,
            uptime: this.uptime,
        }
    }

    /**
     * Restores its state into object.
     * Do not fiddle with this. Not guaranteed to be stable
     * @param restoreData state from serialize()
     */
    public restore(restoreData: {[key: string]: any}) {
        this._macaddr = restoreData._macaddr,
        this._vendor = restoreData._vendor,
        this.uptime = restoreData.uptime,
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
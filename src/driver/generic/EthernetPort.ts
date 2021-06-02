/**
 * Ethernet port config object
 */
export abstract class EthernetPort {
    /**
     * Name of the Ethernet port
     */
    public portName = '';
    /**
     * 802.1Q tag number
     */
    public tag = 0;
    public isActive = false;
    private _linkSpeed = 0; // in Mbps
    public autoneg = true;
    public duplex: 'Full' | 'Half' | 'None' = 'None';

    /**
     * Convert its state into normal k-v pair form.
     * Do not fiddle with this. Not guaranteed to be stable
     * @returns Current state. Do not fiddle with this
     */
    public serialize(): {[key: string]: any} {
        return {
            portName: this.portName,
            tag: this.tag,
            isActive: this.isActive,
            _linkSpeed: this._linkSpeed,
            autoneg: this.autoneg,
            duplex: this.duplex,
        };
    }

    /**
     * Restores its state into object.
     * Do not fiddle with this. Not guaranteed to be stable
     * @param restoreData state from serialize()
     */
    public restore(restoreData: {[key: string]: any}) {
        this.portName = restoreData.portName;
        this.tag = restoreData.tag;
        this.isActive = restoreData.isActive;
        this._linkSpeed = restoreData._linkSpeed;
        this.autoneg = restoreData.autoneg;
        this.duplex = restoreData.duplex;
    }

    /**
     * Human readable label for 802.1Q tag
     */
    public abstract get tagLabel(): string;
    
    /**
     * linkspeed getter
     * 
     * @returns Current link speed of the port
     */
    public get linkSpeed(): string {
        // TODO: Implement automatic unit changer
        return this._linkSpeed + 'Mbps';
    }

    /**
     * linkspeed setter
     * 
     * @param speed - linkspeed in following format: [0-9]+[KMGTP]bps
     */
    public set linkSpeed(speed: string) {
        console.log(speed)
        const split = speed.match(/([0-9]+)([KMGTP]bps)/);
        if (split == null) {
            throw new Error('Invalid linkspeed');
        }

        const base = parseInt(split[1], 10);
        const unit = split[2];

        let multiplier = 0;
        switch(unit) {
            case 'bps':
                multiplier = 0.000001;
                break;
            case 'Kbps':
                multiplier = 0.001;
                break;
            case 'Mbps':
                multiplier = 1;
                break;
            case 'Gbps':
                multiplier = 1000;
                break;
            case 'Tbps':
                multiplier = 10000000;
                break;
            case 'Pbps':
                multiplier = 10000000000;
                break;
        }

        this._linkSpeed = base * multiplier;
    }

    /**
     * Get linkspeed as number
     */
    public linkSpeedAsNumeric(unit: 'Mbps'): number {
        if (unit === 'Mbps') {
            return this._linkSpeed;
        } else {
            throw new Error(`Unsupported unit ${unit}`);
        }
    }
}
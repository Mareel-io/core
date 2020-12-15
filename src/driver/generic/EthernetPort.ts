export abstract class EthernetPort {
    public portName = '';
    public isActive = false;
    private _linkSpeed = 0; // in Mbps
    public duplex: 'Full' | 'Half' | 'None' = 'None';
    
    public get linkSpeed(): string {
        // TODO: Implement automatic unit changer
        return this._linkSpeed + 'Mbps';
    }

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
}
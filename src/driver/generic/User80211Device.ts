import { UserDevice } from './UserDevice';

export abstract class User80211Device extends UserDevice {
    public linkspeed: {rx: number, tx: number} = {rx: 0, tx: 0}; // in Mbps

    /**
     * Convert its state into normal k-v pair form.
     * Do not fiddle with this. Not guaranteed to be stable
     * @returns Current state. Do not fiddle with this
     */
    public serialize(): {[key: string]: any} {
        return {
            super: super.serialize(),
            linkspeed: this.linkspeed,
        };
    }

    public restore(restoreData: {[key: string]: any}) {
        super.restore(restoreData.super);
        this.linkspeed = restoreData.linkSpeed;
    }
}
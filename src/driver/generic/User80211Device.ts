import { UserDevice } from './UserDevice';

export abstract class User80211Device extends UserDevice {
    public linkspeed: {rx: number, tx: number} = {rx: 0, tx: 0}; // in Mbps
}
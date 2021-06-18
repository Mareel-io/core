export interface WLANIFaceCfgState {
    mode: 'ap' | 'sta' | 'adhoc' | 'wds' | 'monitor' | 'mesh',
    disabled: boolean,
    ssid: string,
    bssid: string,
    mesh_id: string,
    hidden: boolean,
    isolate: boolean,
    doth: boolean,
    wmm: boolean,
    encryption: string,
    key: string,
}

export class WLANIFaceCfg {
    public mode: 'ap' | 'sta' | 'adhoc' | 'wds' | 'monitor' | 'mesh' = 'ap';
    public disabled = false;
    public ssid = 'EMPOForever';
    public bssid = 'default'; // 'default' or bssid
    public mesh_id = 'none'; // IEEE 802.11s meshID
    public hidden = false; // Turn off SSID bcast.
    public isolate = false; // client isolation
    public doth = true; // Enable 802.11h support (DFS)
    public wmm = true; // 802.11e support
    public encryption = 'psk2'; // WLAN encryption
    public key = ''; // WLAN PSK key (or RADIUS shared secret)

    constructor() {
        //
    }

    public serialize(): WLANIFaceCfgState {
        return {
            mode: this.mode,
            disabled: this.disabled,
            ssid: this.ssid,
            bssid: this.bssid,
            mesh_id: this.mesh_id,
            hidden: this.hidden,
            isolate: this.isolate,
            doth: this.doth,
            wmm: this.wmm,
            encryption: this.encryption,
            key: this.key,
        };
    }

    public restore(state: WLANIFaceCfgState): void {
        this.mode = state.mode;
        this.disabled = state.disabled;
        this.ssid = state.ssid;
        this.bssid = state.bssid;
        this.mesh_id = state.mesh_id;
        this.hidden = state.hidden;
        this.isolate = state.isolate;
        this.doth = state.doth;
        this.wmm = state.wmm;
        this.encryption = state.encryption;
        this.key = state.key;
    }
}
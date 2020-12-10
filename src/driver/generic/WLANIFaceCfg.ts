export class WLANIFaceCfg {
    public mode: 'ap' | 'sta' | 'adhoc' | 'wds' | 'monitor' | 'mesh' = 'ap';
    public disabled: boolean = false;
    public ssid: string = 'EMPOForever';
    public bssid: string = 'default'; // 'default' or bssid
    public mesh_id: string = 'none'; // IEEE 802.11s meshID
    public hidden: boolean = false; // Turn off SSID bcast.
    public isolate: boolean = false; // client isolation
    public doth: boolean = true; // Enable 802.11h support (DFS)
    public wmm: boolean = true; // 802.11e support
    public encryption: string = 'psk2'; // WLAN encryption
    public key: string = ''; // WLAN PSK key (or RADIUS shared secret)

    constructor() {
        //
    }
}
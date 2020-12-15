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
}
export class WLANDevConfiguration {
    public disabled: boolean = false; // I/F disable
    public channel: number | 'auto' = 'auto'; // Channel
    public hwmode: 'a' | 'b' | 'g' = 'g'; // HW mode
    public htmode: string = 'HT20'; // HT mode. See OpenWWRT doc. (TODO: Define type for it)
    public chanbw: '5' | '10' | '20' | '40' | '80' | '80+80' | '160' = '20'; // Channel BW
    public txpower: number | 'auto' = 'auto'; // TX Power (mW)
    public diversity: boolean = true; // Diversity support
    public rxantenna: number | 'auto' = 'auto'; // HW specific
    public txantenna: number | 'auto' = 'auto'; // HW specific
    public country: string = '00'; // 00 or ISO 3166-1 alpha-2 code.
    public country_ie: boolean = true; // 802.11d country IE enable
    public beacon_int: number = 100; // 802.11 beacon interval (ms)
    public require_mode: 'none' | 'b' | 'g' | 'n' | 'ac' | 'ax' = 'none' // Minimum 802.11 mode requirement

    constructor() {
        //
    }
}
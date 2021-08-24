export interface WLANDevConfigurationState {
    disabled: boolean,
    channel: number | 'auto',
    hwmode: 'a' | 'b' | 'g',
    htmode: string,
    chanbw: '5' | '10' | '20' | '40' | '80' | '80+80' | '160',
    txpower: number | 'auto',
    diversity: boolean,
    rxantenna: number | 'auto',
    txantenna: number | 'auto',
    country: string,
    country_ie: boolean,
    beacon_int: number,
    require_mode: 'none' | 'b' | 'g' | 'n' | 'ac' | 'ax',
}

export class WLANDevConfiguration {
    public disabled = false; // I/F disable
    public channel: number | 'auto' = 'auto'; // Channel
    public hwmode: 'a' | 'b' | 'g' = 'g'; // HW mode
    public htmode = 'HT20'; // HT mode. See OpenWWRT doc. (TODO: Define type for it)
    public chanbw: '5' | '10' | '20' | '40' | '80' | '80+80' | '160' = '20'; // Channel BW
    public txpower: number | 'auto' = 'auto'; // TX Power (mW)
    public diversity = true; // Diversity support
    public rxantenna: number | 'auto' = 'auto'; // HW specific
    public txantenna: number | 'auto' = 'auto'; // HW specific
    public country = '00'; // 00 or ISO 3166-1 alpha-2 code.
    public country_ie = true; // 802.11d country IE enable
    public beacon_int = 100; // 802.11 beacon interval (ms)
    public require_mode: 'none' | 'b' | 'g' | 'n' | 'ac' | 'ax' = 'none' // Minimum 802.11 mode requirement

    constructor() {
        //
    }

    /**
     * Intended to use in RPC communication
     * 
     * @returns Serialized state
     */
    public serialize(): WLANDevConfigurationState {
        return {
            disabled: this.disabled,
            channel: this.channel,
            hwmode: this.hwmode,
            htmode: this.htmode,
            chanbw: this.chanbw,
            txpower: this.txpower,
            diversity: this.diversity,
            rxantenna: this.rxantenna,
            txantenna: this.txantenna,
            country: this.country,
            country_ie: this.country_ie,
            beacon_int: this.beacon_int,
            require_mode: this.require_mode,
        }
    }

    /**
     * Intended to use in RPC communication
     * 
     * @param state Serialized state
     */
    public restore(state: WLANDevConfigurationState): void {
        this.disabled = state.disabled;
        this.channel = state.channel;
        this.hwmode = state.hwmode;
        this.htmode = state.htmode;
        this.chanbw = state.chanbw;
        this.txpower = state.txpower;
        this.diversity = state.diversity;
        this.rxantenna = state.rxantenna;
        this.txantenna = state.txantenna;
        this.country = state.country;
        this.country_ie = state.country_ie;
        this.beacon_int = state.beacon_int;
        this.require_mode = state.require_mode;
    }
}
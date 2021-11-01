export class VLANTag {
    private tag: number;
    private alias: string;

    constructor(tag: number, alias: string) {
        this.tag = tag;
        this.alias = alias;
    }

    /**
     * Convert its state into normal k-v pair form.
     * Do not fiddle with this. Not guaranteed to be stable
     *
     * @returns Current state. Do not fiddle with this
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public serialize(): {[key: string]: any} {
        return {
            tag: this.tag,
            alias: this.alias,
        }
    }

    /**
     * Restore its state from k-v pair from. Intended for internal use.
     *
     * @param restoreData - State snapshotted using serialize()
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public restore(restoreData: {[key: string]: any}) {
        this.tag = restoreData.tag;
        this.alias = restoreData.alias;
    }

    /**
     * Returns VLAN tag number
     *
     * @returns VLAN tag number
     */
    public getTag(): number {
        return this.tag;
    }

    /**
     * Returns VLAN alias name
     * 
     * @returns VLAN alias
     */
    public getAlias(): string {
        return this.alias;
    }

    /**
     * Set VLAN alias name
     * 
     * @param alias - alias name
     */
    public setAlias(alias: string): void {
        this.alias = alias;
    }
}
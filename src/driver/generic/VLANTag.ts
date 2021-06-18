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
     * @returns Current state. Do not fiddle with this
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public serialize(): {[key: string]: any} {
        return {
            tag: this.tag,
            alias: this.alias,
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public restore(restoreData: {[key: string]: any}) {
        this.tag = restoreData.tag;
        this.alias = restoreData.alias;
    }

    public getTag(): number {
        return this.tag;
    }

    public getAlias(): string {
        return this.alias;
    }

    setAlias(alias: string) {
        this.alias = alias;
    }
}
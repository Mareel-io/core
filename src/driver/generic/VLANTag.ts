export class VLANTag {
    private tag: number;
    private alias: string;

    constructor(tag: number, alias: string) {
        this.tag = tag;
        this.alias = alias;
    }

    getTag() {
        return this.tag;
    }

    getAlias() {
        return this.alias;
    }

    setAlias(alias: string) {
        this.alias = alias;
    }
}
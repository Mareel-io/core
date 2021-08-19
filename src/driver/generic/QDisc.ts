export class QDisc {
    private _algo: string;
    private _config: {[key: string]: string | number} = {};

    constructor(algo: string) {
        this._algo = algo;
    }

    public serialize(): {algo: string, config: {[key: string]: string | number}} {
        return {
            algo: this._algo,
            config: this._config,
        };
    }

    public restore(state: {algo: string, config: {[key: string]: string | number}}): void {
        this._algo = state.algo;
        this._config = state.config;
    }

    public set algo(algo: string) {
        this._algo = algo;
    }

    public get algo(): string {
        return this._algo;
    }

    public get config(): {[key: string]: string | number} {
        return this._config;
    }

    public clearConfig(): void {
        this._config = {};
    }

    public setConfigParam(key: string, value: string | number): void {
        this._config[key] = value;
    }

    public getConfigParam(key: string): string | number | undefined {
        return this._config[key];
    }

    public deleteConfigParam(key: string): void {
        delete this._config[key];
    }
}
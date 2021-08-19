import { QDisc } from "./QDisc";

export abstract class QOSController {
    constructor() {
        //
    }

    public abstract getRules(): Promise<QDisc[]>;
    public abstract applyRules(rules: QDisc[]): Promise<void>;
    public abstract addRule(rule: QDisc): Promise<void>;
}
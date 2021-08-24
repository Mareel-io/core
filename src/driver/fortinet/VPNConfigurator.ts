import { AxiosInstance } from "axios";

export class VPNConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        this.api = api;
    }
}

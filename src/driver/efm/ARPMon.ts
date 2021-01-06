import { AxiosInstance } from "axios";
import { ResponseChecker } from "./ResponseChecker";

interface ARPEntry {
    ip: string,
    mac: string,
    type: string,
    hostname: string,
}

export class ARPMon {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        //super();
        this.api = api;
    }

    public async getARPTable(): Promise<ARPEntry> {
        const res = await this.api.get('/sess-bin/info.cgi', {
            params: {
                act: 'node_list',
            },
        });
        ResponseChecker.check(res.data);

        const list = res.data.split('\n').map((elem: string) => {
            const elemArr = elem.split(';');

            return {
                ip: elemArr[0],
                mac: elemArr[1].replace(/-/, ':'),
                type: elemArr[2],
                hostname: elemArr[3],
            } as ARPEntry;
        });

        return list;
    }
}
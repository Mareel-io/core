import { AxiosInstance } from 'axios';
import { JSDOM } from 'jsdom';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../generic/SwitchConfigurator';
import { EthernetPort } from './EthernetPort';

export class SwitchConfigurator extends GenericSwitchConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    public async getSwitchPorts(): Promise<[EthernetPort]> {
        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: {
                tmenu: 'iframe',
                smenu: 'trafficconf_linksetup_linkstatus_status',
            },
        });

        const dom = new JSDOM(res.data);
        const portTable = dom.window.document.body.getElementsByTagName('tr');

        const ports = [] as unknown as [EthernetPort];
        for (let i = 0; i < portTable.length; i++) {
            const row = portTable[i].childNodes;
            console.log(row.item(0).textContent)

            for (let i = 1; i < row.length; i++) {
                if (ports[i - 1] == null) {
                    const portCheck = row.item(i).textContent;
                    if (portCheck == null || portCheck == '') {
                        continue;
                    }
                    ports[i - 1] = new EthernetPort();
                }

                let speed = '';
                let duplex = '';
                switch(row.item(0).textContent) {
                    case '포트 번호':
                        ports[i - 1].portName = row.item(i).textContent as string;
                        break;
                    case 'Link':
                        ports[i - 1].isActive = row.item(i).textContent === 'On';
                        break;
                    case '속도':
                        speed = row.item(i).textContent as string;
                        if (speed === '--') {
                            speed = '0Kbps';
                        } else {
                            speed = `${speed}bps`;
                        }
                        ports[i - 1].linkSpeed = speed;
                        break;
                    case 'Duplex':
                        duplex = row.item(i).textContent as string;
                        if (duplex === '--') {
                            duplex = 'None';
                        }
                        ports[i - 1].duplex = duplex as 'Full' | 'Half' | 'None';
                        break;
                }
            }
        }

        return ports;
    }
}
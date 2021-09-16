import { AxiosInstance } from 'axios';
import { JSDOM } from 'jsdom';
import qs from 'qs';
import { SwitchConfigurator as GenericSwitchConfigurator } from '../generic/SwitchConfigurator';
import { EthernetPort } from './EthernetPort';
import { ResponseChecker } from './ResponseChecker';
import { VLAN } from './VLAN';

/**
 * Ethernet switch configurator
 */
export class SwitchConfigurator extends GenericSwitchConfigurator {
    private api: AxiosInstance;
    constructor(api: AxiosInstance) {
        super();
        this.api = api;
    }

    /**
     * Get Ethernet switch ports status
     * 
     * @returns EthernetPort array
     */
    public async getSwitchPorts(): Promise<EthernetPort[]> {
        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: {
                tmenu: 'iframe',
                smenu: 'trafficconf_linksetup_linkstatus_status',
            },
        });
        ResponseChecker.check(res.data);

        const dom = new JSDOM(res.data);
        const portTable = dom.window.document.body.getElementsByTagName('tr');

        const ports = [] as EthernetPort[];
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

                // Pseudo-VLAN tagging
                if (ports[i - 1].portName.startsWith('WAN')) {
                    ports[i - 1].tag = 1;
                } else {
                    ports[i - 1].tag = 2;
                }
            }
        }

        return ports;
    }

    /**
     * Convert generic EthernetPort configuration into EFM-specific port configuration
     *
     * @param port - EthernetPort object
     * @param portIdx - Port index.
     */
    private getPortCfgObject(port: EthernetPort, portIdx: number) {
        const portCfg: {[key: string]: string | number} = {};
        const idx = portIdx - 1;

        let portoff = '0';
        if (idx === 0) {
            portoff = `${65537 + idx}`;
        } else {
            portoff = `${idx}`.padStart(5, '0');
        }

        portCfg[`mode${portoff}`] = port.autoneg ? 'auto' : 'forced';
        portCfg[`speed${portoff}`] = port.linkSpeedAsNumeric('Mbps');
        portCfg[`duplex${portoff}`] = port.duplex.toLowerCase();
        portCfg.port = portoff;

        return portCfg;
    }

    /**
     * Update Ethernet switch configuration
     * 
     * @param port - EthernetPort object
     * @param portIdx - Port index. Note that it is 1-based index, not zero-based.
     */
    public async setSwitchPort(port: EthernetPort, portIdx: number): Promise<void> {
        const portCfg = this.getPortCfgObject(port, portIdx);
        portCfg.tmenu = 'iframe';
        portCfg.smenu = 'trafficconf_linksetup_linksetup_status';
        portCfg.act = 'setport'

        const qry = qs.stringify(portCfg);
        const res = await this.api.post('/sess-bin/timepro.cgi', qry, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        ResponseChecker.check(res.data);
    }

    public async getAllVLAN(): Promise<VLAN[]> {
        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: {
                tmenu: 'iframe',
                smenu: 'trafficconf_linksetup_linkstatus_status',
            },
        });
        ResponseChecker.check(res.data);

        const dom = new JSDOM(res.data);

        const portTable = Array.from(dom.window.document.body.getElementsByTagName('tr'))
        .filter((elem) => {
            // Bad for performance but...
            try {
                return (elem.childNodes[0].childNodes[0] as HTMLInputElement).type === 'checkbox';
            } catch {
                return false;
            }
        });

        const rawRows = portTable.map((elem) => {
            return Array.from(elem.childNodes).map(e => e.childNodes[0]).slice(1);
        });

        return rawRows.map((e) => {
            const vlan = new VLAN('port-based');
            vlan.alias = e[0].textContent!;
            const ports: boolean[] = e.slice(1).map((e) => {
                return !(e.textContent === '--');
            });

            ports.forEach((elem, idx) => {
                if (elem) {
                    const port = new EthernetPort();
                    // TODO: Fetch real data
                    port.portName = (idx + 1) + '';
                    port.duplex = 'Full';

                    vlan.addPortMember(port, 'U')
                }
            });
            
            return vlan;
        });
    }

    public async getVLAN(vid: number): Promise<VLAN> {
        const vlans = await this.getAllVLAN();
        return vlans[vid];
    }

    public async setVLAN(vlan: VLAN): Promise<void> {
        const params: {[key: string]: string | number} = {
            tmenu: 'switchconf',
            smenu: 'vlan',
            act: 'modifyvlan',
            dellist: '',
            trunkname: 'None',
            trunkmap: 0,
            vname: vlan.alias,
        };

        vlan.getPortList().forEach((port) => {
            const name = port.port.portName;
            const portNo = parseInt(name);
            if (portNo === 1) {
                return;
            }

            params[`p${portNo}`] = 'on';
        });

        const res = await this.api.get('/sess-bin/timepro.cgi', {
            params: params,
        });
    }
}
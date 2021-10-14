import { CiscoCredential } from "../driver/cisco/lib";
import { EFMCredential } from "../driver/efm/lib";

export interface ConnectorDevice {
    id: string,
    addr: string,
    type: 'efm' | 'cisco' | 'dummy',
    credential: EFMCredential | CiscoCredential,
}

export interface ConnectorClientConfig {
    client: {
        disableCiscoConfigDaemon?: boolean,
        disableTFTPDaemon?: boolean,
        timeout: {
            callTimeout: number,
            pingTimeout: number,
        }
    },
    remote: {
        token: string,
        url: string,
    },
    tftpserver: {
        hostip: string,
    },
    devices: ConnectorDevice[],
}

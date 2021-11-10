import { CiscoCredential } from "../driver/cisco/lib";
import { EFMCredential } from "../driver/efm/lib";
import { FortiAuthToken } from "../driver/fortinet/util/types";

export interface ConnectorDevice {
    id: string,
    addr: string,
    type: 'efm' | 'cisco' | 'fortinet' | 'dummy',
    credential: EFMCredential | CiscoCredential | FortiAuthToken,
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
    devicedb: string,
}

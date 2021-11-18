import { networkInterfaces } from "os";
import axios from "axios";
import { RPCReturnType, RPCv2Request } from "../jsonrpcv2";
import { RPCMethodTable, RPCRequestHandler } from "../requesthandler/RPCRequestHandler";

export class IPAddr extends RPCRequestHandler {
    protected rpcMethodTable: RPCMethodTable = {
        getKeyLocalAddr: async() => {
            // Fetch Mareel Key's local ip address
            // TODO: Need to implement hardware-based switch

            const ret = {
                ipv4: [] as string[],
                ipv6: [] as string[],
            };

            const nets = networkInterfaces();
            const iface = nets['eth0']; // Mareel Key v1 interface
            iface!.forEach((elem) => {
                if (elem.family === 'IPv4') {
                    ret.ipv4.push(elem.address);
                } else if (elem.family === 'IPv6') {
                    ret.ipv6.push(elem.address);
                } else {
                    // What the fuck?
                }
            })

            return ret;
        },
        getKeyWANAddr: async() => {
            // Fetch Mareel key's external IP address
            // TODO: Use our own service, instead of wtfismyip.com
            const ret = {
                ipv4: [] as string[],
                ipv6: [] as string[],
            };

            try {
                // TODO: Implement ipv4 v6 separation.
                const res = await axios.get('https://wtfismyip.com/json');
                ret.ipv4.push(res.data.YourFuckingIPAddress);
            } catch (e) {
                // Do nothing
            }

            return ret;
        }
    };

    constructor() {
        super('', 'syssvc::IPAddr');
    }

    public async init(): Promise<void> {
        // Do nothing.
    }

    public getRPCHandler(): (req: RPCv2Request) => Promise<RPCReturnType<any>> {
        return async (req: RPCv2Request) => {
            return await this.handleRPCRequest(req);
        }
    }
}
import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { NetTester } from '../../driver/efm/monitor/NetTester';
import { FirewallConfigurator } from '../../driver/generic/FirewallConfigurator';
import { Logman } from '../../driver/generic/Logman';
import { WLANConfigurator } from '../../driver/generic/wlan';
import { WLANUserDeviceStat } from '../../driver/generic/WLANUserDeviceStat';
import { RPCProvider, RPCv2Request } from '../jsonrpcv2';
import { RPCFirewallConfigurator } from './FireallConfigurator';
import { RPCLogman } from './Logman';
import { RPCSwitchConfigurator } from "./SwitchConfigurator";
import { RPCWLANConfigurator } from './WLANConfigurator';
import { RPCWLANUserDeviceStat } from './WLANUserDeviceStat';

export class RPCControllerFactory extends GenericControllerFactory {
    private ws: WebSocket;
    private rpc: RPCProvider;
    private devices: {id: string, type: string}[] | null = null;

    constructor(ws: WebSocket) {
        super('');
        this.ws = ws;
        this.rpc = new RPCProvider(this.ws);
    }

    /**
     * Dummy function. it is okay to call this (for API similarity)
     * but not necessary
     */
    public async authenticate(): Promise<void> {
        // Do nothing
    }

    /**
     * Initialize the RPCControllerFactory
     */
    public async init(): Promise<void> {
        await new Promise((ful, _rej) => {
            const cb = async (notify: RPCv2Request): Promise<void> => {
                if (notify.method == 'init') {
                    ful(null);
                    this.rpc.removeNotifyHandler(cb);
                }
            }
            this.rpc.addNotifyHandler(cb);
        });
        console.log('Pong received.');
        this.devices = (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            method: 'getRegisteredDevices',
            params: [],
        })) as {id: string, type: string}[];
    }

    public getDevices(): {id: string, type: string}[] {
        if (this.devices == null) {
            throw new Error('You have to initialize first!');
        }

        return this.devices;
    }

    public getSwitchConfigurator(targetId: string): RPCSwitchConfigurator {
        const switchConfigurator = new RPCSwitchConfigurator(this.rpc, targetId);
        return switchConfigurator;
    }

    public getWLANConfigurator(targetId: string): WLANConfigurator {
        return new RPCWLANConfigurator(this.rpc, targetId);
    }

    public getWLANUserDeviceStat(targetId: string): WLANUserDeviceStat {
        return new RPCWLANUserDeviceStat(this.rpc, targetId);
    }

    public getLogman(targetId: string): Logman {
        return new RPCLogman(this.rpc, targetId);
    }

    public getFirewallConfigurator(targetId: string): FirewallConfigurator {
        return new RPCFirewallConfigurator(this.rpc, targetId);
    }

    public getNetTester(targetId: string): NetTester {
        throw new Error('Method not implemented.');
    }
}
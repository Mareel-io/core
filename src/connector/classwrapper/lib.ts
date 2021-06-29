import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { NetTester } from '../../driver/efm/monitor/NetTester';
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
        await this.rpc.remoteNotify({
            jsonrpc: '2.0',
            method: 'serverInit',
            params: [],
        });
        await new Promise((ful, _rej) => {
            const cb = async (notify: RPCv2Request): Promise<void> => {
                if (notify.method == 'clientInit') {
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

    public async ping(): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            class: 'base',
            method: 'ping',
            params: [],
        });
    }

    public async errorPing(): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
	        class: 'base',
            method: 'error',
            params: [],
        });
    }

    public getSwitchConfigurator(targetId: string): RPCSwitchConfigurator {
        const switchConfigurator = new RPCSwitchConfigurator(this.rpc, targetId);
        return switchConfigurator;
    }

    public getWLANConfigurator(targetId: string): RPCWLANConfigurator {
        return new RPCWLANConfigurator(this.rpc, targetId);
    }

    public getWLANUserDeviceStat(targetId: string): RPCWLANUserDeviceStat {
        return new RPCWLANUserDeviceStat(this.rpc, targetId);
    }

    public getLogman(targetId: string): RPCLogman {
        return new RPCLogman(this.rpc, targetId);
    }

    public getFirewallConfigurator(targetId: string): RPCFirewallConfigurator {
        return new RPCFirewallConfigurator(this.rpc, targetId);
    }

    public getNetTester(targetId: string): NetTester {
        throw new Error('Method not implemented.');
    }
}
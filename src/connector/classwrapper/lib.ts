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
     * Dummy function. it is okay to call this (for API similarity)
     * but not necessary
     */
    public async refreshAuth(): Promise<void> {
        // Do nothing
    }

    /**
     * Initialize the RPCControllerFactory
     */
    public async init(): Promise<void> {
        this.rpc.remoteNotify({
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

    /**
     * Fetch available devices in given Mareel Key
     * 
     * @returns Device list
     */
    public getDevices(): {id: string, type: string}[] {
        if (this.devices == null) {
            throw new Error('You have to initialize first!');
        }

        return this.devices;
    }

    /**
     * RPC ping. Not network ping.
     */
    public async ping(): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            class: 'base',
            method: 'ping',
            params: [],
        });
    }

    /**
     * RPC ping which will always fail. Intended to test use only.
     */
    public async errorPing(): Promise<void> {
        await this.rpc.remoteCall({
            jsonrpc: '2.0',
            class: 'base',
            method: 'error',
            params: [],
        });
    }

    /**
     * Get SwitchConfigurator using device ID.
     * 
     * @param targetId device ID
     * @returns SwitchConfigurator of given target
     */
    public getSwitchConfigurator(targetId: string): RPCSwitchConfigurator {
        const switchConfigurator = new RPCSwitchConfigurator(this.rpc, targetId);
        return switchConfigurator;
    }

    /**
     * Get WLANConfigurator using device ID.
     * 
     * @param targetId device ID
     * @returns WLANConfigurator of given target
     */
    public getWLANConfigurator(targetId: string): RPCWLANConfigurator {
        return new RPCWLANConfigurator(this.rpc, targetId);
    }

    /**
     * Get WLANUserDeviceStat using device ID.
     * 
     * @param targetId device ID
     * @returns WLANUserDeviceStat of given target
     */
    public getWLANUserDeviceStat(targetId: string): RPCWLANUserDeviceStat {
        return new RPCWLANUserDeviceStat(this.rpc, targetId);
    }

    /**
     * Get Logman using device ID.
     * 
     * @param targetId device ID
     * @returns Logman of given target
     */
    public getLogman(targetId: string): RPCLogman {
        return new RPCLogman(this.rpc, targetId);
    }

    /**
     * Get FirewallConfigurator using device ID.
     * 
     * @param targetId device ID
     * @returns FirewallConfigurator of given target
     */
    public getFirewallConfigurator(targetId: string): RPCFirewallConfigurator {
        return new RPCFirewallConfigurator(this.rpc, targetId);
    }

    public getNetTester(targetId: string): NetTester {
        throw new Error('Method not implemented.');
    }
}
import WebSocket from 'ws';

import { GenericControllerFactory } from "../..";
import { NetTester } from '../../driver/efm/monitor/NetTester';
import { MarilError, MarilRPCTimeoutError } from '../../error/MarilError';
import { ConnectorDevice } from '../../types/lib';
import { logger } from '../../util/logger';
import { RPCProvider, RPCv2Request } from '../jsonrpcv2';
import { RPCAuthConfigurator } from './AuthConfigurator';
import { RPCFirewallConfigurator } from './FireallConfigurator';
import { RPCLogman } from './Logman';
import { RPCProfileManager } from './ProfileManager';
import { RPCRouteConfigurator } from './RouteConfigurator';
import { RPCSwitchConfigurator } from "./SwitchConfigurator";
import { RPCSwitchQoS } from './SwitchQoS';
import { RPCTrafficStatMonitor } from './TrafficStatMonitor';
import { RPCVPNConfigurator } from './VPNConfigurator';
import { RPCWLANConfigurator } from './WLANConfigurator';
import { RPCWLANUserDeviceStat } from './WLANUserDeviceStat';

export class RPCControllerFactory extends GenericControllerFactory {
    private ws: WebSocket;
    private rpc: RPCProvider;
    private devices: {id: string, type: string}[] | null = null;
    private deviceConfigs: ConnectorDevice[];

    constructor(ws: WebSocket, devices: ConnectorDevice[]) {
        super('');
        this.ws = ws;
        this.rpc = new RPCProvider(this.ws);
        this.deviceConfigs = devices;
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

        if(await this.updateDevices(this.deviceConfigs)) {
            throw new MarilError("Reboot required");
        }

        // If we don't cancel below, it will float the world forever.
        await new Promise((ful, rej) => {
            const cb = async (notify: RPCv2Request): Promise<void> => {
                const timeout = setTimeout(() => {
                    this.rpc.removeNotifyHandler(cb);
                    rej(new MarilRPCTimeoutError('Timed out!'));
                }, 30000); // TODO: Make it configurable timeout
                if (notify.method == 'clientInit') {
                    clearTimeout(timeout);
                    this.rpc.removeNotifyHandler(cb);
                    ful(null);
                }
            }
            this.rpc.addNotifyHandler(cb);
        });

        logger.debug('Pong received.');
        this.devices = (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            method: 'getRegisteredDevices',
            params: [],
        })) as {id: string, type: string}[];
    }

    /**
     * Update available devices in Mareel Key
     * 
     * @param devices - Update device with credential
     * @returns - true if daemon restart is required, false if not
     */
    public async updateDevices(devices: ConnectorDevice[]): Promise<boolean> {
        const resp = (await this.rpc.remoteCall({
            jsonrpc: '2.0',
            class: 'hwconfig',
            method: 'updateConfig',
            params: [devices],
        })) as {reboot: boolean};

        return resp.reboot;
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
     * @param targetId - device ID
     * @returns SwitchConfigurator of given target
     */
    public getSwitchConfigurator(targetId: string): RPCSwitchConfigurator {
        const switchConfigurator = new RPCSwitchConfigurator(this.rpc, targetId);
        return switchConfigurator;
    }

    /**
     * Get SwitchQoS using device ID.
     * 
     * @param targetId - device ID
     * @returns SwitchQoS of given target
     */
    public getSwitchQoS(targetId: string): RPCSwitchQoS {
        const switchQoS = new RPCSwitchQoS(this.rpc, targetId);
        return switchQoS;
    }

    /**
     * Get WLANConfigurator using device ID.
     * 
     * @param targetId - device ID
     * @returns WLANConfigurator of given target
     */
    public getWLANConfigurator(targetId: string): RPCWLANConfigurator {
        return new RPCWLANConfigurator(this.rpc, targetId);
    }

    /**
     * Get WLANUserDeviceStat using device ID.
     * 
     * @param targetId - device ID
     * @returns WLANUserDeviceStat of given target
     */
    public getWLANUserDeviceStat(targetId: string): RPCWLANUserDeviceStat {
        return new RPCWLANUserDeviceStat(this.rpc, targetId);
    }

    /**
     * Get Logman using device ID.
     * 
     * @param targetId - device ID
     * @returns Logman of given target
     */
    public getLogman(targetId: string): RPCLogman {
        return new RPCLogman(this.rpc, targetId);
    }

    /**
     * Get FirewallConfigurator using device ID.
     * 
     * @param targetId - device ID
     * @returns FirewallConfigurator of given target
     */
    public getFirewallConfigurator(targetId: string): RPCFirewallConfigurator {
        return new RPCFirewallConfigurator(this.rpc, targetId);
    }

    public getNetTester(targetId: string): NetTester {
        throw new Error('Method not implemented.');
    }

    public getRouteConfigurator(targetId: string): RPCRouteConfigurator {
        return new RPCRouteConfigurator(this.rpc, targetId);
    }

    public getTrafficStatMonitor(targetId: string): RPCTrafficStatMonitor {
        return new RPCTrafficStatMonitor(this.rpc, targetId);
    }

    public getAuthConfigurator(targetId: string): RPCAuthConfigurator {
        return new RPCAuthConfigurator(this.rpc, targetId);
    }

    public getVPNConfigurator(targetId: string): RPCVPNConfigurator {
        return new RPCVPNConfigurator(this.rpc, targetId);
    }

    public getProfileManager(targetId: string): RPCProfileManager {
        return new RPCProfileManager(this.rpc, targetId);
    }
}

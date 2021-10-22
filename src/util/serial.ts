import { promises as fs } from 'fs';

export class SerialUtil {
    public static async getPlatformStrs(): Promise<string[]> {
        const platformStr = await fs.readFile('/sys/firmware/devicetree/base/compatible');
        return platformStr.toString('utf-8').split('\x00');
    }

    public static async getCpuSerial(): Promise<string> {
        const cpuserial = await fs.readFile('/sys/firmware/devicetree/base/serial-number');
        return cpuserial.toString('utf-8').replace('\x00', '');
    }

    public static async getSerial() {
        const codename = (await this.getPlatformStrs())[0].split(',')[1].toUpperCase();
        return `MK-${codename}-${(await this.getCpuSerial()).toUpperCase()}`;
    }
}
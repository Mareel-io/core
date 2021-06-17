export class LogEntry {
    message: string;
    timestamp: Date;

    constructor(timestamp: Date, message: string) {
        this.message = message;
        this.timestamp = timestamp;
    }

    public serialize(): {[key: string]: string} {
        return {
            message: this.message,
            timestamp: this.timestamp.toISOString(),
        };
    }

    public restore(restoreData: {[key: string]: string}) {
        this.message = restoreData.message;
        this.timestamp = new Date(restoreData.timestamp);
    }

    public toString() {
        return `${this.timestamp.toISOString()} - ${this.message}`;
    }
}

export abstract class Logman {
    public abstract queryLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]>;
}
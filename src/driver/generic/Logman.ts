export class LogEntry {
    message: string;
    timestamp: Date;

    constructor(timestamp: Date, message: string) {
        this.message = message;
        this.timestamp = timestamp;
    }

    public toString() {
        return `${this.timestamp.toISOString()} - ${this.message}`;
    }
}

export abstract class Logman {
    public abstract queryLog(source: string, from: Date | undefined, to: Date | undefined): Promise<LogEntry[]>;
}
import { CustomError } from "ts-custom-error";

export class MarilError extends CustomError {}
export class InvalidParameterError extends MarilError {}
export class AuthError extends MarilError {}
export class UnsupportedFeatureError extends MarilError {}
export class ResourceNotAvailableError extends MarilError {}
export class MethodNotImplementedError extends MarilError {}

export class MarilRPCError extends MarilError {
    private remoteStackTrace = 'unknown';

    constructor(msg: string, name = 'MarilRPCError', stack?: string) {
        super(msg);
        Object.defineProperty(this, 'name', { value: name });
        if (stack != null) {
            this.remoteStackTrace = stack;
        }
    }

    public getRemoteStackTrace(): string {
        return this.remoteStackTrace;
    }
}

export class MarilRPCTimeoutError extends MarilRPCError {
    constructor(msg: string) {
        super(msg, 'MarilRPCTimeoutError');
    }
}
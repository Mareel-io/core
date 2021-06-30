import { CustomError } from "ts-custom-error";

export class MarilError extends CustomError {
    constructor(msg: string) {
        super(msg);
    }
}

export class MarilRPCError extends MarilError {
    constructor(msg: string, name = 'MarilRPCError') {
        super(msg);
    }
}

export class InvalidParameterError extends MarilError {
    constructor(msg: string) {
        super(msg);
    }
}

export class AuthError extends MarilError {
    constructor(msg: string) {
        super(msg);
    }
}
export class UnsupportedFeatureError extends MarilError {
    constructor(msg: string) {
        super(msg);
    }
}
export class ResourceNotAvailableError extends MarilError {
    constructor(msg: string) {
        super(msg);
    }
}

export class MethodNotImplementedError extends MarilError {
    constructor(msg?: string) {
        super(msg || 'Method not implemented.');
    }
}
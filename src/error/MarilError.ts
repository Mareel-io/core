import { CustomError } from "ts-custom-error";

export class MarilError extends CustomError {
    constructor(msg: string) {
        super(msg);
        this.name = 'MarilError';
    }
}

export class InvalidParameterError extends MarilError {
    constructor(msg: string) {
        super(msg);
        this.name = 'InvalidParameterError';
    }
}

export class AuthError extends MarilError {
    constructor(msg: string) {
        super(msg);
        this.name = 'AuthError';
    }
}
export class UnsupportedFeatureError extends MarilError {
    constructor(msg: string) {
        super(msg);
        this.name = 'UnsupportedFeatureError';
    }
}
export class ResourceNotAvailableError extends MarilError {
    constructor(msg: string) {
        super(msg);
        this.name = 'ResourceNotAvailableError';
    }
}

export class MethodNotImplementedError extends MarilError {
    constructor(msg?: string) {
        super(msg || 'Method not implemented.');
        this.name = 'MethodNotImplementedError';
    }
}
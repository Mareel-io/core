import { CustomError } from "ts-custom-error";

export class MarilError extends CustomError {}
export class InvalidParameterError extends MarilError {}
export class AuthError extends MarilError {}
export class UnsupportedFeatureError extends MarilError {}
export class ResourceNotAvailableError extends MarilError {}
export class MethodNotImplementedError extends MarilError {}

export class MarilRPCError extends MarilError {
    constructor(msg: string, name = 'MarilRPCError') {
        super(msg);
        Object.defineProperty(this, 'name', { value: name });
    }
}
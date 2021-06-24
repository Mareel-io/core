import { CustomError } from "ts-custom-error";

export class MarilError extends CustomError {}
export class AuthError extends MarilError {}
export class UnsupportedFeatureError extends MarilError {}
export class ResourceNotAvailableError extends MarilError {}

export class MethodNotImplementedError extends MarilError {
    constructor() {
        super('Method not implemented.');
    }
}
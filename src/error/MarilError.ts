export class MarilError extends Error {}
export class AuthError extends MarilError {}
export class UnsupportedFeatureError extends MarilError {}
export class ResourceNotAvailableError extends MarilError {}

export class MethodNotImplementedError extends MarilError {
    constructor() {
        super('Method not implemented.');
    }
}
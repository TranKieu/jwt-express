import { HttpError } from './HttpError';

export class MethodNotAllowed extends HttpError {
    name = "MethodNotAllowedError";
    status = 405;
    constructor(methode: string) {
        super();
        Object.setPrototypeOf(this, MethodNotAllowed.prototype);
        this.message = `Methode ${methode} is not allowed !`;
    }
}
import { HttpError } from "./HttpError";

export class MethodNotAllowed extends HttpError {
    name = "MethodNotAllowedError";
    status = 405;
    constructor(url: string) {
        super();
        Object.setPrototypeOf(this, MethodNotAllowed.prototype);
        this.message = `Methode ${url} is not allowed !`;
    }
}
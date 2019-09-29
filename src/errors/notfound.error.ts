import { HttpError } from "./HttpError";

export class NotFound extends HttpError {
    name = "ResourceNotFoundError";
    status = 404;
    constructor(url: string) {
        super();
        Object.setPrototypeOf(this, NotFound.prototype);
        this.message = `${url} does not exist !`;
    }
}

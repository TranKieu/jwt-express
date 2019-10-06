import { HttpError } from './HttpError';

/**
 * Lỗi dành cho Authentication Token
 */
export class AuthenticationToken extends HttpError {

    name = "AuthenticationTokenError";
    status = 401;
    constructor(information: string) {
        super();
        Object.setPrototypeOf(this, AuthenticationToken.prototype);

        this.message = `Authentication token ${information}`;
    }

}
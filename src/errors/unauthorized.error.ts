import { HttpError } from './HttpError';

export class Unauthorized extends HttpError {
    name = 'UnauthorizedError';
    status = 401;
    message = 'Authentication credentials not valid.';
    constructor(){
        super();
        Object.setPrototypeOf(this, Unauthorized.prototype);
    }
}
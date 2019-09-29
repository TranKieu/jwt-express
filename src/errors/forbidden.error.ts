import { HttpError } from './HttpError';

export class Forbidden extends HttpError {
    name = 'ForbiddenError';
    status = 403;
    constructor(req: string) {
        super();
        this.message = `You're missing permission to execute this request ${req} !`;
        Object.setPrototypeOf(this, Forbidden.prototype);
    }
}
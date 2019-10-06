import { HttpError } from './HttpError';

export class BadRequest extends HttpError {
    name = 'BadRequestError';
    status = 400;
    message = 'Request has wrong format.';
    constructor(message?: string) {
        super();
        Object.setPrototypeOf(this, BadRequest.prototype);
        // dành cho lỗi validate => Request API sai
        if (message !== undefined) {
            this.message = `Request ${message} has wrong format.`;
        }
    }
}
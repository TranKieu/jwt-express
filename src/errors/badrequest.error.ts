import { HttpError } from './HttpError';

export class BadRequest extends HttpError {
    name = 'BadRequestError';
    status = 400;
    constructor(req: any) {
        super();
        Object.setPrototypeOf(this, BadRequest.prototype);
        // dành cho lỗi validate => Request API sai
        this.message = `Request ${req} has wrong format.`;
    }
}
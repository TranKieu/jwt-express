import { HttpError } from './HttpError';

// giống vs lỗi token bỏ đi cũng dc
export class Unauthorized extends HttpError {
    name = 'UnauthorizedError';
    status = 403;
    message = 'You are not authorized';
    constructor() {
        super();
        Object.setPrototypeOf(this, Unauthorized.prototype);
    }
}
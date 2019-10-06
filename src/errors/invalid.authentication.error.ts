import { HttpError } from './HttpError';

/**
 * Lỗi dành cho đăng nhập
 */
export class InvalidAuthentication extends HttpError {
    name = 'InvalidAuthenticationError';
    status = 401;
    message = 'Invalid authentication credentials provided.';
    constructor(credential?: string) {
        super();
        Object.setPrototypeOf(this, InvalidAuthentication.prototype);
        if (credential !== undefined) {
            this.message = `Login failed : wrong ${credential} credentials.`;
        }
    }
}


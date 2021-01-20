import { HttpError } from './http-error';

export class Unauthorized extends HttpError {
  name = 'UnauthorizedError';
  status = 401;
  message = 'Authentication Token is invaild or has expired!';
  constructor(credential?: string) {
    super();
    Object.setPrototypeOf(this.message, Unauthorized.prototype);
    if (credential) {
      this.message = credential;
    }
  }
}

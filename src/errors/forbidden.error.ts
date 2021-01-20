import { isObject } from 'class-validator';
import { HttpError } from './http-error';

export class Forbidden extends HttpError {
  name = 'ForbiddenError';
  status = 403;
  message = "You don't have permission!";
  constructor(message?: string) {
    super();
    Object.setPrototypeOf(this, Forbidden.prototype);
    if (message) {
      this.message = message;
    }
  }
}

import { HttpError } from './http-error';

export class BadRequest extends HttpError {
  name = 'BadRequestError';
  status = 400;
  message = 'Request has wrong format!';
  constructor(request?: string) {
    super();
    Object.setPrototypeOf(this, BadRequest.prototype);
    this.message = `Request ${request} has wrong format!`;
  }
}

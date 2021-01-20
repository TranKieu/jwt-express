import { HttpError } from './http-error';

export class NotFound extends HttpError {
  name = 'ResourceNotFoundError';
  status = 404;
  constructor(request: string) {
    super();
    Object.setPrototypeOf(this, NotFound.prototype);

    this.message = `${request} does not exist !`;
  }
}

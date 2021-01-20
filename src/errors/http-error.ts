export class HttpError extends Error {
  name = 'HttpError';
  status = 500;
  message = 'something wrong!';
  constructor() {
    super();
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

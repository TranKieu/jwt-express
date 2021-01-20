import { HttpError } from './http-error';

export class PreconditionFailed extends HttpError {
  status = 412;
  name = 'PreconditionFailedError';
  // điều kiện đầu vào ko thỏa mãn
  constructor(property?: string) {
    super();
    Object.setPrototypeOf(this, PreconditionFailed.prototype);
    this.message = `${property} is invalid! `;
  }
}

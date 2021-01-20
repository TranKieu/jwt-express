import { HttpError } from './http-error';

export class ResourceExist extends HttpError {
  name = 'ResourceExitsError';
  status = 409; // Conflict = Duplication

  constructor(resource: string) {
    super();
    Object.setPrototypeOf(this, ResourceExist.prototype);
    this.message = `This ${resource} is already exists!`;
  }
}

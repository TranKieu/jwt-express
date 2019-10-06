import { HttpError } from './HttpError';

export class Duplication extends HttpError {
    name = "DuplicationError";
    status = 409;  // Conflict
    constructor(content: string) {
        super();
        this.message = `${content} is already exists!`;
    }
}
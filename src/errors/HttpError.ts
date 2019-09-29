export class HttpError extends Error {
  name = "HttpError";
  status = 500;
  message = "something wrong!";
  constructor() {
    super();
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/*
export class EntityColumnNotFound extends Error {
    name = "EntityColumnNotFound";
    constructor(propertyPath: string) {
        super();
        // quan trong
        Object.setPrototypeOf(this, EntityColumnNotFound.prototype);
        this.message = `No entity column "${propertyPath}" was found.`;
    }
}

*/
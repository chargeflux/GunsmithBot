import PublicError from "./PublicError";

export default class ValidationError extends PublicError {
  constructor(message: string) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}

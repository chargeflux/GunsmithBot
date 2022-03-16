import PublicError from "./publicError";

export default class ValidationError extends PublicError {
  constructor(message: string) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}

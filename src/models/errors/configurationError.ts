export default class ConfigurationError extends Error {
  constructor(message: string) {
    super("Configuration is not valid. " + message);

    Error.captureStackTrace(this, this.constructor);
  }
}

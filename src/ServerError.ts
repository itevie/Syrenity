export enum ErrorType {
  UNKNOWN,
  DATABASE_ERROR,
}

export interface ErrorDetails {
  message: string;

  /**
   * If this is provided, this will be sent to the client
   * instead of "message"
   */
  safeMessage?: string;

  /**
   * Status code, if not provided will default to 500
   */
  statusCode?: number;

  /**
   * Where the error originated from, e.g. param.channelId
   */
  at?: string;

  type?: ErrorType;

  /**
   * An error object
   */
  error: Error;
}
export default class ServerError extends Error {
  public details: ErrorDetails;

  constructor(details: ErrorDetails) {
    // Set defaults
    if (!details.statusCode) details.statusCode = 500;
    if (!details.type) details.type = ErrorType.UNKNOWN;

    // Set up
    super(details.message);
    this.details = details;
  }
}

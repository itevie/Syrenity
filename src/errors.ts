import ServerError, {ErrorDetails, ErrorType} from "./ServerError";

/**
 * Error returned when database fails
 */
export class DatabaseError extends ServerError {
  constructor(options: ErrorDetails) {
    super(options);
    this.details.type = ErrorType.DATABASE_ERROR;
  }
}
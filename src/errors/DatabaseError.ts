import SyrenityError, { ErrorDetails } from "./BaseError";

export default class DatabaseError extends SyrenityError {
  constructor(details: ErrorDetails) {
    super(details);
  }

  public static resourceNotFound(): DatabaseError {
    return new DatabaseError({
      message: `Not found`,
      errorCode: "NonexistentResource",
      statusCode: 404,
    });
  }
}

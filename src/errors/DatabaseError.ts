import SyrenityError, { ErrorDetails } from "./BaseError";

export default class DatabaseError extends SyrenityError {
  constructor(details: ErrorDetails) {
    super(details);
  }
}

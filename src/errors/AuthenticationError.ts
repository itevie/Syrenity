import SyrenityError, { ErrorDetails } from "./BaseError";

export default class AuthenticationError extends SyrenityError {
  constructor(details: ErrorDetails) {
    super(details);
  }
}

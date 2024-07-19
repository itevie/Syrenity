import BaseError, { ErrorDetails } from "./BaseError";

export default class AuthenticationError extends BaseError {
    constructor(details: ErrorDetails) {
        super(details);
    }
}
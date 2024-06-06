import BaseError, { ErrorDetails } from "./BaseError";

export default class DatabaseError extends BaseError {
    constructor(details: ErrorDetails) {
        super(details);
    }
}
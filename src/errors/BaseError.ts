export interface ErrorDetails {
    message: string,
    safeMessage?: string,
    statusCode?: number,
}

export default class BaseError extends Error {
    public data: ErrorDetails;
    constructor(details: ErrorDetails) {
        super(details.message);
        this.data = details;
    }
}
import ErrorType from "./ErrorTypes";

export interface ErrorDetails {
  message: string;
  safeMessage?: string;
  statusCode?: number;
  errorCode: ErrorType;
  data?: { [key: string]: any };
  at?: string;
}

export default class SyrenityError extends Error {
  public data: ErrorDetails;
  constructor(details: ErrorDetails) {
    super(details.message);
    this.data = details;
  }

  get statusCode() {
    return this.data.statusCode ?? 400;
  }

  public extract() {
    const data: { [key: string]: any } = {
      error: {
        code: this.data.errorCode,
        message: this.data.safeMessage ?? this.data.message,
      },
    };

    if (this.data.data) data.error.data = this.data.data;
    if (this.data.at) data.error.at = this.data.at;

    return data;
  }

  public toString() {
    return this.extract();
  }
}

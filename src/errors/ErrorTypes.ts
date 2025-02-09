type ErrorType =
  // Basic
  | "UnknownError"
  | "UnknownServerError"
  | "UnknownDatabaseError"

  // Database

  // Body Validation
  | "InvalidBody"

  // Files
  | "MustBeSyrenityFileUrl"
  | "FileNotOnDisk"

  // URL Validation
  | "UrlParameterTypeError"
  | "MustBeSelfForParameter"
  | "InvalidUrl"

  // Permission
  | "MissingPermissions"
  | "NotAllowedToViewResource"
  | "NotAuthor"

  // Authentication
  | "NotLoggedIn"
  | "InvalidToken"
  | "InvalidAuthorizationFormat"
  | "SessionsOnly"
  | "InvalidEmailOrPassword"

  // Resource
  | "NonexistentResource"
  | "AlreadyAMember";
export default ErrorType;

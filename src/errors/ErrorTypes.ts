type ErrorType =
    // Basic
    | "UnknownError"
    | "UnknownServerError"
    | "UnknownDatabaseError"

    // Database

    // Body Validation
    | "InvalidBody"

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

    // Resource
    | "NonexistentResource"
    | "AlreadyAMember"
export default ErrorType;
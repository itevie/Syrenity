type ErrorType =
  // Basic
  | "UnknownError"
  | "UnknownServerError"
  | "UnknownDatabaseError"
  | "Conflict"
  // Database

  // Body Validation
  | "InvalidBody"
  | "CannotEditDMChannel"

  // Files
  | "MustBeSyrenityFileUrl"
  | "FileNotOnDisk"
  | "InvalidFileSize"
  | "InvalidMimeType"
  | "InvalidFileType"

  // Emojis
  | "BadEmoji"

  // Relationship
  | "NotARecipient"

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
  | "TooManyUsers"
  | "EmailExists"

  // Resource
  | "NonexistentResource"
  | "AlreadyAMember";
export default ErrorType;

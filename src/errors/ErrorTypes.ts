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
  | "DownloadFailed"
  | "InvalidBase64"

  // Servers
  | "UnallowedServerOwnerAction"

  // Members
  | "UserNotInServer"

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
  | "AlreadyAMember"

  // Application
  | "ApplicationAlreadyJoined"
  | "ApplicationNotPublic"

  // Friend Requests
  | "FriendRequestExists"

  // Codes
  | "UnknownVerifyCode"
  | "ExpiredVerifyCode";
export default ErrorType;

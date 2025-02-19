declare function wrapResult<T, E extends Error = Error>(
  promise: Promise<T>
): Promise<Result<T, E>>;

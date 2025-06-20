export default class Result<T, E extends Error = Error> {
  private constructor(
    private readonly _ok?: T,
    private readonly _err?: E,
  ) {}

  /**
   * Get the ok value. If the result is not ok, the error value will be **thrown**
   */
  public get ok(): T {
    if (this._ok === undefined) throw this._err;
    return this._ok;
  }

  /**
   * Get the err value. If the result is ok, a new error will be **thrown**
   */
  public get err(): E {
    if (this._err === undefined) throw new Error(`Result was not an error`);
    return this._err;
  }

  /**
   * Check if it is ok
   * @returns the result
   */
  public isOk(): this is { ok: T } {
    return this._err === undefined;
  }

  /**
   * Check if it is an error
   * @returns the result
   */
  public isErr(): this is { err: E } {
    return this._err !== undefined;
  }

  /**
   * Creates a new result ok value
   * @param value
   * @returns
   */
  public static ok<T>(value: T): Result<T, never> {
    return new Result(value);
  }

  /**
   * Creates a new result error value
   * @param value
   * @returns
   */
  public static err<E extends Error>(value: E): Result<any, E> {
    return new Result(undefined, value);
  }
}

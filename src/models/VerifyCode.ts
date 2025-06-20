import { query } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import Result from "../util/result";

export interface DatabaseVerifyCode {
  code: string;
  user_id: number;
  reason: string;
  expires_in: number;
  created_at: Date;
}

export type VerifyCodeReasons = "forgot-password";

export default class VerifyCode {
  public constructor(public data: DatabaseVerifyCode) {}

  public async delete(): Promise<void> {
    query({
      text: "DELETE FROM verify_codes WHERE code = $1 AND reason = $2",
      values: [this.data.code, this.data.reason],
    });
  }

  public static async fetch(
    code: string,
    reason: string,
  ): Promise<Result<VerifyCode>> {
    let queryResult = (
      await query<DatabaseVerifyCode>({
        text: "SELECT * FROM verify_codes WHERE code = $1 AND reason = $2",
        values: [code, reason],
      })
    ).rows[0];
    if (!queryResult)
      return Result.err(
        new DatabaseError({
          message: "Could not find a verify code with those details",
          errorCode: "UnknownVerifyCode",
          statusCode: 404,
        }),
      );

    let result = new VerifyCode(queryResult);

    if (
      result.data.expires_in - (Date.now() - result.data.created_at.getTime()) <
      0
    ) {
      await result.delete();
      return Result.err(
        new DatabaseError({
          message: "Code expired",
          errorCode: "ExpiredVerifyCode",
          statusCode: 401,
        }),
      );
    }

    return Result.ok(result);
  }
}

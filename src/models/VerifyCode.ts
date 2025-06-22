import { query } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { units } from "../util/ms";
import Result from "../util/result";
import { randomID } from "../util/util";

export interface DatabaseVerifyCode {
  code: string;
  user_id: number;
  reason: string;
  expires_in: number;
  created_at: Date;
}

export type VerifyCodeReason = "forgot-password";
const verifyCodeLengthMap: Record<VerifyCodeReason, number> = {
  "forgot-password": units.minute * 20,
};

export default class VerifyCode {
  public constructor(public data: DatabaseVerifyCode) {}

  public async delete(): Promise<void> {
    await query({
      text: "DELETE FROM verify_codes WHERE code = $1 AND reason = $2",
      values: [this.data.code, this.data.reason],
    });
  }

  public static async create(
    userId: number,
    reason: VerifyCodeReason,
    code: string,
  ): Promise<VerifyCode> {
    return new VerifyCode(
      (
        await query<DatabaseVerifyCode>({
          text: "INSERT INTO verify_codes (code, user_id, reason, expires_in) VALUES ($1, $2, $3, $4) RETURNING *",
          values: [code, userId, reason, verifyCodeLengthMap[reason]],
        })
      ).rows[0],
    );
  }

  public static async fetch(
    code: string,
    reason: VerifyCodeReason,
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

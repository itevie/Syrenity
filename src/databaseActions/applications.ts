import * as database from '../database';
import * as errors from '../errors';
import * as uuid from 'uuid';
import { CacheKey } from '../util/CacheManager';

export default {
  fetchByUserId: async (applicationId: number): Promise<Application> => {
    const res = await database.query({
      text: database.queries.FETCH_APPLICATION_BY_USER_ID,
      values: [applicationId],
      cache: {
        key: CacheKey.APPLICATION_BY_USER_ID,
        name: "" + applicationId
      }
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch applicationId ${applicationId}`,
        safeMessage: `Failed to fetch the applicaion ${applicationId}`,
        statusCode: 404,
        error: new Error()
      });

    return res.rows[0] as Application;
  },

  userIdHasToken: async (applicationId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_APPLICATION_BY_USER_ID,
      values: [applicationId],
      cache: {
        key: CacheKey.USER_ID_HAS_TOKEN,
        name: "" + applicationId
      }
    });

    // Check if it succeeded
    return res.rows[0];
  },

  fetchByToken: async (token: string): Promise<Application> => {
    const res = await database.query({
      text: database.queries.FETCH_APPLICATION_BY_TOKEN,
      values: [token],
      cache: {
        key: CacheKey.APPLICATION_BY_TOKEN,
        name: "" + token
      }
    });

    if (!res.rows[0])
      return Promise.reject(new errors.DatabaseError({
        message: `Failed to fetch the token ${token}`,
        safeMessage: `No account is accociated with the provided token`,
        statusCode: 404,
        error: new Error()
      }));

    return res.rows[0] as Application;
  },

  fetchUserApplications: async (ownerId: number): Promise<User[]> => {
    const res = await database.query({
      text: database.queries.FETCH_USER_APPLICATIONS,
      values: [ownerId]
    });

    return res.rows as User[];
  },

  resetToken: async (applicationId: number, userId: number) => {
    const token = generateToken(userId);

    await database.query({
      text: database.queries.UPDATE_APPLICATION_TOKEN,
      values: [applicationId, token],
    });

    return token;
  }
}

function generateToken(id: number) {
  const i = Buffer.from(id.toString()).toString("base64");
  const t = Buffer.from((Date.now() / 100).toString()).toString("base64");
  const r = Buffer.from(uuid.v4()).toString("base64");
  return `${i}.${t}.${r}`;
}
import { query, queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { connections } from "../ws/websocketUtil";

export interface DatabaseCustomStatus {
  user_id: number;
  visibility: string | null;
  device: string | null;
  status_text: string | null;
  expires_at: Date | null;
  last_seen: Date | null;
}

export type EditCustomStatusOptions = Partial<
  Omit<DatabaseCustomStatus, "user_id">
>;

export default class SyCustomStatus {
  constructor(public data: DatabaseCustomStatus) {}

  public static async create(userId: number): Promise<SyCustomStatus> {
    const result = await queryOne<DatabaseCustomStatus>({
      text: "INSERT INTO custom_status (user_id) VALUES ($1) RETURNING *;",
      values: [userId],
    });

    return new SyCustomStatus(result!);
  }

  public static _fix(result: DatabaseCustomStatus) {
    const conn = [...connections.values()].find(
      (x) => x.user.data.id === result.user_id
    );

    if (!conn) {
      result.visibility = "invisible";
    } else {
      result.visibility = result.visibility ?? "online";
    }
  }

  public static async fetchMany(
    ids: number[]
  ): Promise<Map<number, SyCustomStatus>> {
    const results = await query<DatabaseCustomStatus>({
      text: "SELECT * FROM custom_status WHERE user_id = ANY($1)",
      values: [ids],
    });

    const map = new Map<number, SyCustomStatus>();

    for (const row of results.rows) {
      SyCustomStatus._fix(row);
      map.set(row.user_id, new SyCustomStatus(row));
    }

    // Create missing statuses
    const missing = ids.filter((id) => !map.has(id));

    if (missing.length > 0) {
      for (const id of missing) {
        const created = await SyCustomStatus.create(id);
        SyCustomStatus._fix(created.data);
        map.set(id, created);
      }
    }

    return map;
  }

  public static async fetch(
    id: number,
    noFix: boolean = false
  ): Promise<SyCustomStatus> {
    let result = await queryOne<DatabaseCustomStatus>({
      text: "SELECT * FROM custom_status WHERE user_id = $1",
      values: [id],
    });

    if (!result) result = (await SyCustomStatus.create(id)).data;
    if (!noFix) SyCustomStatus._fix(result);

    return new SyCustomStatus(result);
  }

  public async edit(options: EditCustomStatusOptions): Promise<SyCustomStatus> {
    const entries = Object.entries(options).filter((x) => x[1] !== undefined);

    const setClause = entries.map((x, i) => `${x[0]} = $${i + 2}`).join(", ");

    if (setClause.length === 0) return this;

    const queryText = `
      UPDATE custom_status
      SET ${setClause}
      WHERE user_id = $1
      RETURNING *;
    `;

    const values = [this.data.user_id, ...entries.map((x) => x[1])];

    const result = await query<DatabaseCustomStatus>({
      text: queryText,
      values,
    });

    SyCustomStatus._fix(result.rows[0]);

    return new SyCustomStatus(result.rows[0]);
  }

  toJSON() {
    return this.data;
  }
}

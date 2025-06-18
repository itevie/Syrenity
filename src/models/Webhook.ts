import { query } from "../database/database";
import SyChannel from "./Channel";
import SyServer from "./Servers";
import SyUser from "./User";

export interface DatabaseWebhook {
  id: string;
  proxy_user: number;
  description: string | null;
  channel_id: number;
  server_id: number;
  creator_id: number;
  created_at: Date;
}

export type ExpandedWebhook = DatabaseWebhook & {
  channel: SyChannel;
  server: SyServer;
  creator: SyUser | null;
};

export default class SyWebhook {
  public constructor(public data: DatabaseWebhook) {}

  public async expand(): Promise<ExpandedWebhook> {
    return {
      ...this.data,
      channel: await SyChannel.fetch(this.data.channel_id),
      server: await SyServer.fetch(this.data.server_id),
      creator: !this.data.creator_id
        ? null
        : await SyUser.fetch(this.data.creator_id),
    };
  }

  public static async fetch(id: string): Promise<SyWebhook> {
    return new SyWebhook(
      (
        await query<DatabaseWebhook>({
          text: "SELECT * FROM webhooks WHERE id = $1",
          values: [id],
        })
      ).rows[0],
    );
  }

  toJSON() {
    return this.data;
  }
}

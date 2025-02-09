import { query } from "./database";

const _actions = {
  async get(id: number | string): Promise<Server> {
    return (
      await query<Server>({
        text: "SELECT * FROM guilds WHERE id = $1;",
        values: [id],
        noRowsError: {
          message: `Failed to fetch server ${id}`,
          errorCode: "NonexistentResource",
        },
      })
    ).rows[0];
  },

  async getChannels(id: number | string): Promise<Channel[]> {
    return (
      await query<Channel>({
        text: "SELECT * FROM channels WHERE guild_id = $1;",
        values: [id],
      })
    ).rows;
  },
} as const;

export default _actions;

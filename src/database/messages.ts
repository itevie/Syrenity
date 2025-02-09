import { query } from "./database";

const _actions = {
  delete: async (messageId: number): Promise<void> => {
    await query({
      text: "DELETE FROM messages WHERE id = $1",
      values: [messageId],
    });
  },
} as const;

export default _actions;

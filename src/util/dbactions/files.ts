import { query } from "../database";

export default {
  create: async (
    name: string,
    mime: string | null = null,
    original_url: string | null = null,
  ): Promise<SyFile> => {
    return (
      await query({
        text: `INSERT INTO files(file_name, mime, original_url) VALUES ($1, $2, $3) RETURNING *`,
        values: [name, mime, original_url],
      })
    ).rows[0] as SyFile;
  },

  get: async (id: string): Promise<SyFile> => {
    return (
      await query({
        text: `SELECT * FROM files WHERE id = $1`,
        values: [id],
      })
    ).rows[0] as SyFile;
  },

  delete: async (id: string): Promise<void> => {
    await query({
      text: "DELETE FROM files WHERE id = $1",
      values: [id],
    });
  },

  setDeleting: async (id: string, value: boolean): Promise<void> => {
    await query({
      text: "UPDATE files SET is_deleting = $2 WHERE id = $1",
      values: [id, value],
    });
    await query({
      text: "UPDATE files SET original_url = null WHERE id = $1",
      values: [id],
    });
  },
};

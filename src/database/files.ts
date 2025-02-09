import { createWriteStream, mkdirSync, WriteStream } from "fs";
import { query } from "./database";
import path from "path";
import { fileStoreLocation } from "..";
import { randomID } from "../util/util";
import { extension } from "mime-types";
import fixupURLForProxy from "../util/proxyFixup";
import axios from "axios";
import { PassThrough } from "stream";

const _actions = {
  get: async (id: string): Promise<SyFile> => {
    return (
      await query<SyFile>({
        text: "SELECT * FROM files WHERE id = $1",
        values: [id],
      })
    ).rows[0];
  },

  getByUrl: async (url: string): Promise<SyFile | null> => {
    return (
      await query<SyFile>({
        text: "SELECT * FROM files WHERE original_url = $1",
        values: [url],
      })
    ).rows[0];
  },

  setFileName: async (id: string, fileName: string): Promise<void> => {
    await query({
      text: "UPDATE files SET file_name = $2 WHERE id = $1",
      values: [id, fileName],
    });
  },

  create: async (fileName: string, originalUrl?: string): Promise<SyFile> => {
    return (
      await query<SyFile>({
        text: "INSERT INTO files (file_name, original_url) VALUES ($1, $2) RETURNING *",
        values: [fileName, originalUrl],
      })
    ).rows[0];
  },

  delete: async (id: string): Promise<void> => {
    await query({
      text: "DELETE FROM files WHERE id = $1",
      values: [id],
    });
  },

  downloadAndCreate: async (url: string): Promise<SyFile> => {
    return await _actions.downloadTo(url)[0];
  },

  downloadTo: async (
    url: string,
    fileObject: SyFile | null = null
  ): Promise<[SyFile, PassThrough, string]> => {
    const headers = fixupURLForProxy(url);

    const response = await axios.get(url, {
      headers,
      responseType: "stream",
    });

    if (fileObject === null)
      fileObject = await _actions.create(
        `proxied-${randomID(10)}.${extension(response.headers["content-type"])}`,
        url
      );

    const folder = path.resolve(
      path.join(
        fileStoreLocation + "/",
        fileObject.created_at.toLocaleDateString().replace(/\//g, "-")
      )
    );
    mkdirSync(folder, { recursive: true });
    const actualPath = path.join(
      folder,
      `${fileObject.id}-${fileObject.file_name}`
    );

    const fileStream = createWriteStream(actualPath);
    const passthrough = new PassThrough();
    response.data.pipe(passthrough);

    passthrough.pipe(fileStream);

    return [fileObject, passthrough, response.headers["content-type"]];
  },
} as const;

export default _actions;

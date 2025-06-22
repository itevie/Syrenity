import { PassThrough, PassThrough as Readable, Stream } from "node:stream";
import { query } from "../database/database";
import path from "node:path";
import { fileStoreLocation } from "..";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
} from "node:fs";
import { getS3Object, uploadFileToS3 } from "../database/s3";
import config from "../config";
import axios from "axios";
import fixupURLForProxy from "../util/proxyFixup";
import * as uuid from "uuid";
import { extension } from "mime-types";
import sharp from "sharp";
import Logger from "../client/src/dawn-ui/Logger";
import DatabaseError from "../errors/DatabaseError";

export interface DatabaseFile {
  id: string;
  created_at: Date;
  file_name: string;
  original_url: string | null;
  is_deleting: boolean;
  mime: string | null;
}

const logger = new Logger("file");

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default class SyFile {
  constructor(public data: DatabaseFile) {}

  public get directoryLocation() {
    return path.join(
      fileStoreLocation,
      this.data.created_at.toLocaleDateString().replace(/\//g, "-"),
    );
  }

  public get fileName() {
    return `${this.data.id}-${this.data.file_name}`;
  }

  public get fileLocation() {
    const filePath = path.join(this.directoryLocation, this.fileName);
    return filePath;
  }

  public async setFileName(fileName: string): Promise<void> {
    await query({
      text: "UPDATE files SET file_name = $2 WHERE id = $1",
      values: [this.data.id, fileName],
    });
  }

  public async delete(): Promise<void> {
    await query({
      text: "DELETE FROM files WHERE id = $1",
      values: [this.data.id],
    });
  }

  public async getStream(): Promise<Stream> {
    if (existsSync(this.fileLocation)) {
      return createReadStream(this.fileLocation);
    }

    try {
      let s3object = await getS3Object(this.data.id);
      this.writeLocal(s3object as PassThrough);
      return s3object;
    } catch {
      if (this.data.original_url)
        return await this.uploadUrl(this.data.original_url, true);
      else
        throw new DatabaseError({
          errorCode: "DownloadFailed",
          statusCode: 404,
          message: `Could not download file for ${this.data.id}`,
        });
    }
  }

  public async resize(size: number, stream?: Stream): Promise<Stream> {
    const newPath = path.join(
      this.directoryLocation,
      `${size}@${this.fileName}`,
    );

    if (!existsSync(newPath)) {
      const passthrough = new PassThrough();
      (stream || (await this.getStream()))
        .pipe(sharp({ animated: true }).resize(size, size))
        .pipe(passthrough);
      passthrough.pipe(createWriteStream(newPath));
      return passthrough;
    } else {
      return createReadStream(newPath);
    }
  }

  public static async uploadFileNew(
    url: string,
  ): Promise<{ file: SyFile; stream: Readable }> {
    const response = await axios.get(url, {
      headers: fixupURLForProxy(url),
      responseType: "stream",
    });
    const syFile = await SyFile.create(
      `${uuid.v4()}.${extension(response.headers["content-type"])}`,
      url,
      response.headers["content-type"],
    );

    const stream = new Readable();
    response.data.pipe(stream);
    syFile.uploadFile(stream);
    return {
      file: syFile,
      stream,
    };
  }

  public async uploadUrl(
    url: string,
    noS3: boolean = false,
  ): Promise<Readable> {
    const response = await axios.get(url, {
      headers: fixupURLForProxy(url),
      responseType: "stream",
    });

    const tee = new Readable();
    response.data.pipe(tee);

    this.uploadFile(tee, noS3);

    const returnStream = new Readable();
    tee.pipe(returnStream);
    return returnStream;
  }

  public async uploadFile(
    stream: Readable,
    noS3: boolean = false,
  ): Promise<void> {
    const fileStream = new Readable();
    const s3Stream = new Readable();

    stream.pipe(fileStream);
    stream.pipe(s3Stream);

    this.writeLocal(fileStream);

    // Run in "background"
    if (!noS3 && config.proxy.saveToS3) {
      (async () => {
        const buffer = await streamToBuffer(s3Stream);

        await uploadFileToS3(this, buffer);
      })();
    }
  }

  private writeLocal(stream: Readable): void {
    if (!config.proxy.saveLocally) return;
    logger.log(`Writing locally: ${this.data.id} to ${this.fileLocation}`);
    mkdirSync(path.dirname(this.fileLocation), { recursive: true });
    const fileStream = createWriteStream(this.fileLocation);
    stream.pipe(fileStream);
  }

  public static async create(
    fileName: string,
    originalUrl?: string,
    mime?: string | null,
  ): Promise<SyFile> {
    return new SyFile(
      (
        await query<DatabaseFile>({
          text: "INSERT INTO files (file_name, original_url, mime) VALUES ($1, $2, $3) RETURNING *",
          values: [fileName, mime, originalUrl],
        })
      ).rows[0],
    );
  }

  public static async fetch(id: string): Promise<SyFile | null> {
    return new SyFile(
      (
        await query<DatabaseFile>({
          text: "SELECT * FROM files WHERE id = $1",
          values: [id],
        })
      ).rows[0],
    );
  }

  public static async fetchByUrl(url: string): Promise<SyFile | null> {
    let result = (
      await query<DatabaseFile>({
        text: "SELECT * FROM files WHERE original_url = $1",
        values: [url],
      })
    ).rows[0];
    if (!result) return null;

    let file = new SyFile(result);
    file.data = result;

    return file;
  }

  toJSON() {
    return this.data;
  }
}

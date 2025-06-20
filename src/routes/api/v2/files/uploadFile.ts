import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import fs from "fs";
import path from "path";
import { fileStoreLocation } from "../../../..";
import config from "../../../../config";
import { extensions, lookup as lookupMime } from "mime-types";
import SyrenityError from "../../../../errors/BaseError";
import https from "https";
import http from "http";
import { URL } from "url";
import SyFile from "../../../../models/File";
import { fuckYouJs } from "../../../../util/util";
import { PassThrough, Readable } from "stream";

interface UploadFileBody {
  file_name: string;
  data: string;
}

function isHttpUrl(data: string): boolean {
  try {
    const url = new URL(data);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed. Status code: ${res.statusCode}`));
          return;
        }

        const chunks: Uint8Array[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

const handler: RouteDetails<UploadFileBody> = {
  method: "POST",
  path: "/files",
  handler: async (req, res) => {
    const body = req.body as UploadFileBody;

    let buffer: Buffer;
    let mime: string | false | undefined;
    let origin: string | null = null;

    if (isHttpUrl(body.data)) {
      // Download from URL
      try {
        buffer = await downloadFile(body.data);
      } catch (err) {
        return res.status(500).send(
          new SyrenityError({
            message: "Failed to download file from URL",
            statusCode: 500,
            errorCode: "DownloadFailed",
          }),
        );
      }

      // Try to guess mime type from URL extension
      const ext = path.extname(new URL(body.data).pathname);
      mime = lookupMime(ext);
      origin = body.data;
    } else {
      // Parse base64
      const match = body.data.match(/^data:(.*?);base64,(.*)$/);
      mime = match?.[1];
      const base64data = match?.[2];

      if (!mime || !base64data) {
        return res.status(400).send(
          new SyrenityError({
            message: "Invalid base64 data URI",
            statusCode: 400,
            errorCode: "InvalidBase64",
          }),
        );
      }

      buffer = Buffer.from(base64data, "base64");
    }

    if (!mime || !extensions[mime]) {
      return res.status(400).send(
        new SyrenityError({
          message: "Invalid or unknown mime type",
          statusCode: 400,
          errorCode: "InvalidMimeType",
        }),
      );
    }

    // Create file record
    const fileObject = await SyFile.create(body.file_name, mime, origin);
    console.log(fileObject);
    await fileObject.uploadFile(Readable.from(buffer) as PassThrough);
    return res.status(200).send(fileObject);
  },

  auth: {
    loggedIn: true,
  },

  body: {
    type: "object",
    properties: {
      file_name: {
        type: "string",
        pattern: config.validity.files.nameRegex,
      },
      data: {
        type: "string",
        maxLength: 6.4e7,
      },
    },
    required: ["file_name", "data"],
  },
};

export default handler;

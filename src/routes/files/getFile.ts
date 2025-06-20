import {
  createReadStream,
  createWriteStream,
  exists,
  existsSync,
  ReadStream,
} from "fs";
import { fileStoreLocation } from "../..";
import { RouteDetails } from "../../types/route";
import { actions } from "../../util/database";
import path from "path";
import SyrenityError from "../../errors/BaseError";
import { lookup } from "mime-types";
import database from "../../database/database";
import config from "../../config";
import { PassThrough } from "stream";
import sharp from "sharp";
import SyFile from "../../models/File";

const handler: RouteDetails = {
  method: "GET",
  path: "/files/:id/:file_name?",
  handler: async (req, res) => {
    // Load details
    const id = req.params.id as string;
    const file = await SyFile.fetch(id);
    const size = parseInt(req.query.size as string) || null;

    // Check if there is a ?size and if it's allowed
    if (size && !config.files.allowedCustomSizes.includes(size as any))
      return res.status(400).send(
        new SyrenityError({
          message: `Invalid file size, allowed sizes are: ${config.files.allowedCustomSizes.join(", ")}`,
          statusCode: 400,
          errorCode: "InvalidFileSize",
        }),
      );

    // Check if the file exists
    if (!file)
      return res.status(404).send(
        new SyrenityError({
          message: "The file does not exist",
          statusCode: 404,
          errorCode: "FileNotOnDisk",
        }),
      );

    let stream = await file.getStream();
    res.setHeader(
      "Content-Type",
      lookup(file.data.file_name) || "application/octet-stream",
    );

    // Check if user wants a smaller size
    if (size) {
      stream = await file.resize(size, stream);
    }

    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Last-Modified", file.data.created_at.toUTCString());
    res.setHeader("ETag", file.data.id);

    stream.pipe(res);
  },

  query: {
    size: {
      optional: true,
      type: "number",
    },
  },

  params: {
    id: {
      is: "file",
    },
  },
};

export default handler;

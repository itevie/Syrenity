import {
  createReadStream,
  createWriteStream,
  exists,
  existsSync,
  readFileSync,
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

const handler: RouteDetails = {
  method: "GET",
  path: "/files/:id/:file_name?",
  handler: async (req, res) => {
    const id = req.params.id as string;
    const file = await actions.files.get(id);
    const size = parseInt(req.query.size as string) || null;

    if (size && !config.files.allowedCustomSizes.includes(size as any))
      return res.status(400).send(
        new SyrenityError({
          message: `Invalid file size, allowed sizes are: ${config.files.allowedCustomSizes.join(", ")}`,
          statusCode: 400,
          errorCode: "InvalidFileSize",
        })
      );

    if (!file)
      return res.status(404).send(
        new SyrenityError({
          message: "The file does not exist",
          statusCode: 404,
          errorCode: "FileNotOnDisk",
        })
      );

    const directoryPath = path.join(
      fileStoreLocation,
      file.created_at.toLocaleDateString().replace(/\//g, "-")
    );

    const filePath = path.join(directoryPath, `${file.id}-${file.file_name}`);

    let stream: PassThrough | ReadStream;

    if (!existsSync(filePath)) {
      if (file.original_url) {
        try {
          const result = await database.files.downloadTo(
            file.original_url,
            file
          );
          res.contentType(
            result[2] ??
              lookup(result[0].file_name) ??
              "application/octet-stream"
          );

          stream = result[1];
        } catch (e) {
          return res.status(500).send(
            new SyrenityError({
              message: "Failed to re-download the image",
              statusCode: 500,
              errorCode: "FileNotOnDisk",
            }).extract()
          );
        }
      } else
        return res.status(500).send(
          new SyrenityError({
            message: "The file was not found on disk",
            statusCode: 500,
            errorCode: "FileNotOnDisk",
          }).extract()
        );
    } else {
      const mimeType = lookup(file.file_name) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);
      stream = createReadStream(filePath);
    }

    // Check if user wants a smaller size
    if (size) {
      const newPath = path.join(
        directoryPath,
        `${size}@${file.id}-${file.file_name}`
      );

      if (!existsSync(newPath)) {
        const passthrough = new PassThrough();
        stream
          .pipe(sharp({ animated: true }).resize(size, size))
          .pipe(passthrough);
        stream = passthrough;
        passthrough.pipe(createWriteStream(newPath));
      } else {
        stream = createReadStream(newPath);
      }
    }

    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Last-Modified", file.created_at.toUTCString());
    res.setHeader("ETag", file.id);

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

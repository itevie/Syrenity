import { createReadStream, existsSync, readFileSync } from "fs";
import { fileStoreLocation } from "../..";
import { RouteDetails } from "../../types/route";
import { actions } from "../../util/database";
import path from "path";
import SyrenityError from "../../errors/BaseError";
import { lookup } from "mime-types";
import database from "../../database/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/files/:id/:file_name?",
  handler: async (req, res) => {
    const id = req.params.id as string;
    const file = await actions.files.get(id);

    if (!file)
      return res.status(404).send(
        new SyrenityError({
          message: "The file does not exist",
          statusCode: 404,
          errorCode: "FileNotOnDisk",
        })
      );

    const p = path.join(
      fileStoreLocation,
      file.created_at.toLocaleDateString().replace(/\//g, "-"),
      `${file.id}-${file.file_name}`
    );

    if (!existsSync(p)) {
      if (file.original_url) {
        try {
          //await database.files.delete(file.id);
          const result = await database.files.downloadTo(
            file.original_url,
            file
          );
          res.contentType(
            result[2] ??
              lookup(result[0].file_name) ??
              "application/octet-stream"
          );

          result[1].pipe(res);
          return;
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
    }

    const mimeType = lookup(file.file_name) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);

    try {
      const fileStream = createReadStream(p);
      fileStream.pipe(res);
    } catch (e) {
      console.log("test");
      console.log(e);
      return res.status(500).send(
        new SyrenityError({
          message: "Could not fetch the file for some unknown reason",
          statusCode: 500,
          errorCode: "UnknownServerError",
        }).extract()
      );
    }
  },

  params: {
    id: {
      is: "file",
    },
  },
};

export default handler;

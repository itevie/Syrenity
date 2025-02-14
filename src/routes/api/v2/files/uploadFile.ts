import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import fs from "fs";
import path from "path";
import { fileStoreLocation } from "../../../..";
import config from "../../../../config";
import { extensions } from "mime-types";
import SyrenityError from "../../../../errors/BaseError";

interface UploadFileBody {
  file_name: string;
  data: string;
}

const handler: RouteDetails<UploadFileBody> = {
  method: "POST",
  path: "/files",
  handler: async (req, res) => {
    const body = req.body as UploadFileBody;

    const match = body.data.match(/^data:(.*?);base64,(.*)$/);
    const mime = match?.[1];
    const data = match?.[2];

    if (!Boolean(extensions[mime ?? ""])) {
      return res.status(400).send(
        new SyrenityError({
          message: "Invalid mime type",
          statusCode: 400,
          errorCode: "InvalidMimeType",
        })
      );
    }

    if (!data) {
      return res.status(400).send(
        new SyrenityError({
          message: "Missing data from data uri",
          statusCode: 400,
          errorCode: "UnknownError",
        })
      );
    }

    // Create file
    const fileObject = await actions.files.create(body.file_name, mime);

    // Save file
    const folder = path.resolve(
      path.join(
        fileStoreLocation + "/",
        fileObject.created_at.toLocaleDateString().replace(/\//g, "-")
      )
    );
    fs.mkdirSync(folder, { recursive: true });

    fs.writeFileSync(
      path.join(folder, `${fileObject.id}-${fileObject.file_name}`),
      Buffer.from(
        body.data.replace(/^data:image\/[a-z]+;base64,/, ""),
        "base64"
      )
    );

    // Done
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

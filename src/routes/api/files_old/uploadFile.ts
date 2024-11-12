import { RouteDetails } from "../../../types/route";
import config from "../../../config.json";
import { actions } from "../../../util/database";
import fs from "fs";
import path from "path";
import { fileStoreLocation } from "../../..";

interface UploadFileBody {
    file_name: string,
    data: string
}

const handler: RouteDetails<UploadFileBody> = {
    method: "POST",
    path: "/api/files",
    handler: async (req, res) => {
        const body = req.body as UploadFileBody;

        // Create file
        const fileObject = await actions.files.create(body.file_name);

        // Save file
        const folder = path.resolve(
            path.join(
                fileStoreLocation + "/",
                fileObject.created_at.toLocaleDateString().replace(/\//g, "-"),
            )
        );
        fs.mkdirSync(folder, { recursive: true });

        fs.writeFileSync(path.join(folder, `${fileObject.id}-${fileObject.file_name}`), Buffer.from(body.data, "base64"));

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
                maxLength: 6.4e+7,
            },
            data: {
                type: "string"
            }
        },
        required: ["file_name", "data"]
    }
};

export default handler;
import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import uploadToImgur from "../../../util/uploadToImgur";

interface UpdateAvatarSchema {
  avatar: string;
}

export default {
  method: "PATCH",
  path: "/api/users/:id/avatar",
  handler: async (req, res) => {
    // Get the details
    const userId = parseInt(req.params.id);

    // Upload image
    let image = "";

    try {
      // Create image
      image = (await uploadToImgur((req.body as UpdateAvatarSchema).avatar, false)).content
    } catch (err) {
      return res.status(500).send({
        message: `Failed to upload the avatar to imgur. Is it in the correct format? (base64)`,
        at: `body.avatar`
      });
    }

    // Update
    await database.actions.users.updateAvatar(userId, image);
    let newUser = await database.actions.users.fetch(userId);

    return res.status(200).send(newUser);
  },
  details: {
    params: {
      id: {
        is: "user",
        mustBeSelf: true,
      }
    },
    body: {
      schema: {
        type: "object",
        properties: {
          avatar: {
            type: "string",
          }
        }
      } as JSONSchemaType<UpdateAvatarSchema>
    }
  }
} as RouteDetails
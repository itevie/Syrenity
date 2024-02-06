import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import uploadToImgur from "../../../util/uploadToImgur";

interface CreateGuildBody {
  avatar?: string;
  name: string;
}

export default {
  method: "POST",
  path: "/api/guilds",
  handler: async (req, res) => {
    const name = (req.body as CreateGuildBody).name;
    const avatar = (req.body as CreateGuildBody).avatar;
    let image: SyrenityFile | null = null;

    // Check if there was an avatar
    if (avatar) {
      try {
        // Create image
        image = await uploadToImgur(avatar, false);
      } catch (err) {
        return res.status(500).send({
          message: `Failed to upload the avatar to imgur. Is it in the correct format? (base64)`,
          at: `body.avatar`
        });
      }
    }

    // Create guild
    const guild = await database.actions.guilds.create(name, image?.content ? image.content : null, (req.user as User).id);

    return res.status(200).send(guild);
  },
  details: {
    auth: {
      loggedIn: true,
    },
    body: {
      schema: {
        type: "object",
        properties: {
          avatar: {
            type: "string",
            nullable: true,
          },

          name: {
            type: "string",
            minLength: 2,
            maxLength: 30,
          }
        },
        required: ["name"],
        errorMessage: {
          properties: {
            name: "Name must be 2-30 characters",
            avatar: "Avatar"
          }
        }
      } as JSONSchemaType<CreateGuildBody>
    }
  }
} as RouteDetails

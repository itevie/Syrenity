import database from "../../../../database/database";
import SyrenityError from "../../../../errors/BaseError";
import SyFile from "../../../../models/File";
import SyUser, { EditUserOptions } from "../../../../models/User";
import { RouteDetails } from "../../../../types/route";
import { send } from "../../../../ws/websocketUtil";

const handler: RouteDetails<EditUserOptions> = {
  method: "PATCH",
  path: "/users/:user",
  handler: async (req, res) => {
    let user = await SyUser.fetch(parseInt(req.params.user));
    const body = req.body as EditUserOptions;

    if (
      body.avatar &&
      !(await SyFile.fetch(body.avatar))?.data.mime?.startsWith("image/")
    ) {
      return res.status(400).send(
        new SyrenityError({
          message: "The avatar file must be an image",
          errorCode: "InvalidFileType",
          statusCode: 400,
        }),
      );
    }

    if (
      body.profile_banner &&
      !(await SyFile.fetch(body.profile_banner))?.data.mime?.startsWith(
        "image/",
      )
    ) {
      return res.status(400).send(
        new SyrenityError({
          message: "The profile banner file must be an image",
          errorCode: "InvalidFileType",
          statusCode: 400,
        }),
      );
    }
    user = await user.edit(req.body as EditUserOptions);

    send({
      type: "UserUpdate",
      payload: {
        user: user.data,
      },
    });

    return res.status(200).send();
  },

  auth: {
    loggedIn: true,
  },

  body: {
    type: "object",
    properties: {
      avatar: {
        type: "string",
        nullable: true,
      },
      profile_banner: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },

  params: {
    user: {
      is: "user",
      mustBeSelf: true,
    },
  },
};

export default handler;

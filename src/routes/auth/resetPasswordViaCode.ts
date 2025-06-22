import SyrenityError from "../../errors/BaseError";
import SyUser from "../../models/User";
import VerifyCode from "../../models/VerifyCode";
import { RouteDetails } from "../../types/route";

interface Body {
  email: string;
  code: string;
  new_password: string;
}

const route: RouteDetails<Body> = {
  path: "/auth/forgot-password/change-password",
  method: "POST",

  handler: async (req, res) => {
    let body = req.body as Body;
    let code = (await VerifyCode.fetch(body.code, "forgot-password")).ok;
    let user = await SyUser.fetch(code.data.user_id);

    if (user.fullData.email !== body.email)
      return res.status(401).send(
        new SyrenityError({
          message: `Email does not match`,
          errorCode: "InvalidEmailOrPassword",
          statusCode: 401,
        }).extract(),
      );

    await user.changePassword(body.new_password);

    return res.status(204).send();
  },

  body: {
    type: "object",
    properties: {
      email: {
        type: "string",
        nullable: false,
      },
      code: {
        type: "string",
        nullable: false,
      },
      new_password: {
        type: "string",
        nullable: false,
      },
    },
    required: ["code", "email", "new_password"],
  },
};

export default route;

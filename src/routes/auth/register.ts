import config from "../../config";
import SyUser from "../../models/User";
import { RouteDetails } from "../../types/route";

interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

const route: RouteDetails<RegisterBody> = {
  method: "POST",
  path: "/auth/register",

  handler: async (req, res, next) => {
    try {
      const body = req.body as RegisterBody;
      const user = await SyUser.create(
        body.email,
        body.password,
        body.username
      );
      return res.status(200).send(user.data);
    } catch (e) {
      next(e);
    }
  },

  body: {
    type: "object",
    properties: {
      email: {
        type: "string",
      },
      password: {
        type: "string",
      },
      username: {
        type: "string",
        ...config.validity.username,
      },
    },
    required: ["email", "password", "username"],
  },
};

export default route;

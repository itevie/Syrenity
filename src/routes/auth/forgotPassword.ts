import { sendEmail } from "../../mail/mailing";
import SyUser from "../../models/User";
import VerifyCode from "../../models/VerifyCode";
import { RouteDetails } from "../../types/route";
import { randomID } from "../../util/util";

interface EmailBody {
  email: string;
}

const command: RouteDetails<EmailBody> = {
  path: "/auth/forgot-password",
  method: "POST",

  handler: async (req, res) => {
    try {
      let user = await SyUser.fetchByEmail((req.body as EmailBody).email);
      const code = await VerifyCode.create(
        user.data.id,
        "forgot-password",
        randomID(20),
      );
      await sendEmail({
        type: "forgot-password",
        user,
        code: code.data.code,
      });
    } catch (e) {
      console.log(e);
    }
    return res.status(204).send();
  },

  auth: {
    loggedIn: false,
  },

  body: {
    type: "object",
    properties: {
      email: {
        type: "string",
        nullable: false,
      },
    },
    required: ["email"],
  },
};

export default command;

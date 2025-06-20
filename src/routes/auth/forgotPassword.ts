import { sendEmail } from "../../mail/mailing";
import SyUser from "../../models/User";
import { RouteDetails } from "../../types/route";

interface EmailBody {
  email: string;
}

const command: RouteDetails<EmailBody> = {
  path: "/auth/forgot-password",
  method: "POST",

  handler: async (req, res) => {
    let user = await SyUser.fetchByEmail((req.body as EmailBody).email);
    sendEmail({
      type: "forgot-password",
      user,
      
    })
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

import SyToken from "../../../../models/Token";
import SyUser from "../../../../models/User";
import { RouteDetails } from "../../../../types/route";
import { randomID } from "../../../../util/util";

``;
const route: RouteDetails = {
  method: "POST",
  path: "/make-test-user",

  handler: async (req, res) => {
    let id = randomID(20);
    const user = await SyUser.create(
      `${id}@${id}syrenitytest.com`,
      `${id}`,
      `TEST-${id}`,
      true
    );
    const token = await SyToken.createFor(user.data.id, "test-account");

    return res.status(200).send({
      user: user.data,
      token: token.data,
    });
  },

  auth: {
    loggedIn: false,
  },
};

export default route;

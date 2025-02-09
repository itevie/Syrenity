import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/files/:id",
  handler: async (req, res) => {
    const id = req.params.id as string;
    const file = await actions.files.get(id);

    // Done
    return res.status(200).send(file);
  },

  params: {
    id: {
      is: "invite",
    },
  },
};

export default handler;

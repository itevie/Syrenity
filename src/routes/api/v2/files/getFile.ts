import { RouteDetails } from "../../../../types/route";
import files from "../../../../util/dbactions/files";

const route: RouteDetails = {
  method: "GET",
  path: "/files/:id",

  handler: async (req, res) => {
    const file = await files.get(req.params.id as string);
    return res.status(200).send(file);
  },

  params: {
    id: {
      is: "file",
      canView: false,
    },
  },
};

export default route;

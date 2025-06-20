import SyFile from "../../../../models/File";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  method: "GET",
  path: "/files/:id",

  handler: async (req, res) => {
    const file = await SyFile.fetch(req.params.id as string);
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

import { RouteDetails } from "../../../types/route";
import database from "../../../database/database";
import { lookup } from "mime-types";

const route: RouteDetails = {
  method: "GET",
  path: "/proxy",

  handler: async (req, res) => {
    const url = req.query["url"] as string;

    if (!url)
      return res.status(400).send({
        message: "Missing url in query",
      });

    // Check if it has been saved
    const storedFileObject = await database.files.getByUrl(url);
    if (storedFileObject) {
      return res.redirect(
        `/files/${storedFileObject.id}/${storedFileObject.file_name}`,
      );
    }

    try {
      const result = await database.files.downloadTo(url);
      res.contentType(
        result[2] ?? lookup(result[0].file_name) ?? "application/octet-stream",
      );

      result[1].pipe(res);
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send("Error occurred while fetching the data.");
    }
  },

  query: {
    url: {
      type: "string",
    },
  },
};

export default route;

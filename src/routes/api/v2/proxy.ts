import { RouteDetails } from "../../../types/route";
import { lookup } from "mime-types";
import SyFile from "../../../models/File";

const route: RouteDetails = {
  method: "GET",
  path: "/proxy",

  handler: async (req, res) => {
    const url = req.query["url"] as string;

    if (!url)
      return res.status(400).send({
        message: "Missing url in query",
      });

    try {
      // Check if it has been saved
      const storedFileObject = await SyFile.fetchByUrl(url);
      if (storedFileObject) {
        return res.redirect(
          `/files/${storedFileObject.data.id}/${storedFileObject.data.file_name}`
        );
      }

      try {
        const result = await SyFile.uploadFileNew(url);
        res.contentType(
          result.file.data.mime
            ? result.file.data.mime
            : (lookup(result.file.data.file_name) as string)
        );

        result.stream.pipe(res);
      } catch (error) {
        if ("use_fallback" in req.query)
          return res.redirect("/public/logo_192.png");

        // Handle errors
        console.error(error);
        res.status(500).send("Error occurred while fetching the data.");
      }
    } catch (e) {
      console.log("use_fallback" in req.query, url);
      if ("use_fallback" in req.query)
        return res.redirect("/public/logo_192.png");
      throw e;
    }
  },

  query: {
    url: {
      type: "string",
    },
  },
};

export default route;

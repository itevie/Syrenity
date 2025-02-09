import axios from "axios";
import { RouteDetails } from "../../../types/route";
import fixupURLForProxy from "../../../util/proxyFixup";

const route: RouteDetails = {
  method: "HEAD",
  path: "/proxy",

  handler: async (req, res) => {
    const url = req.query["url"] as string;

    if (!url)
      return res.status(400).send({
        message: "Missing url in query",
      });

    const requestHeaders = fixupURLForProxy(url);

    try {
      const response = await axios.head(url, {
        headers: requestHeaders,
        responseType: "stream",
      });

      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(200).end();
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

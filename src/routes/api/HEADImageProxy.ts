import Ajv, { JSONSchemaType } from "ajv"
import request from 'request';
require("ajv-errors");
import { RouteDetails } from "../../types/route";
import Logger from "../../Logger";
import config from '../../config.json';
import axios from "axios";

const logger = new Logger("image-proxy");

export default {
  method: "HEAD",
  path: "/api/proxy/image",
  handler: async (req, res) => {
    //if (!config["syrenity+"].includes((req.user as User)?.id))
    //  return res.redirect(`/public/images/no_proxy.png`);

    const url: string = req.query.url as string || "";

    const headers = {};

    if (url?.includes("pximg"))
      headers["Referer"] = "https://www.pixiv.net/";

    logger.log(`Proxying image HEAD ${url}`);
    const data = await axios.head(url, { headers });

    res.contentType(data.headers["content-type"] as string);
    res.status(200).end();
    //request.get(url, { headers: headers }).pipe(res);
  },
  details: {
  }
} as RouteDetails
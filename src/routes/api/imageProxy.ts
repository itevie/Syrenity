import Ajv, { JSONSchemaType } from "ajv"
import request from 'request';
require("ajv-errors");
import { RouteDetails } from "../../types/route";
import Logger from "../../Logger";
import config from '../../config.json';
import axios from "axios";

const logger = new Logger("image-proxy");

export default {
  method: "GET",
  path: "/api/proxy/image",
  handler: async (req, res) => {
    if (config.proxy["requiresSyrenity+"] && !config["syrenity+"].includes((req.user as User)?.id))
      return res.redirect(`/public/images/no_proxy.png`);

    const url: string = req.query.url as string || "";

    const headers = {};

    if (url?.includes("pximg"))
      headers["Referer"] = "https://www.pixiv.net/";

    logger.log(`Proxying image ${url}`);
    const data = await axios.get(url, { headers, responseType: "arraybuffer" });

    res.contentType(data.headers["content-type"] as string);
    res.send(data.data);
    //request.get(url, { headers: headers }).pipe(res);
  },
  details: {
    auth: {
      loggedIn: config.proxy.requiresAuthentication,
    }
  }
} as RouteDetails
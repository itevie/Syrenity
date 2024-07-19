import express from "express";
import Logger from "../util/Logger";

const logger = new Logger("traffic");

export default (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const request = `${req.method.toUpperCase()} ${req.originalUrl}`;
    req.on("end", () => {
        if (res.statusCode > 399)  {
            logger.error(`[${ip}] (${res.statusCode}) ${request}`);
        } else {
            logger.success(`[${ip}] (${res.statusCode}) ${request}`);
        }
    });

    next();
}

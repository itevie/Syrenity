import express from "express";
import BaseError from "../errors/BaseError";

export default (
    err: any,
    res: express.Response,
    req: express.Request,
    next: express.NextFunction,
) => {
    if (err) {
        if (err instanceof BaseError) {
            return res.status(err.statusCode).send(err.extract());
        }
    }

    next(err);
}
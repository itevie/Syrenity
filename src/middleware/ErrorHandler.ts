import express from "express";
import SyrenityError from "../errors/BaseError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";
import Logger from "../util/Logger";

const logger = new Logger("error-handler");

export default (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err) {
    if (
      err instanceof SyrenityError ||
      err instanceof AuthenticationError ||
      err instanceof DatabaseError
    ) {
      return res.status(err.statusCode).send(err.extract());
    } else {
      logger.error(`Non-syrenity error thrown! Stopping.`);
      console.log(err);
      process.exit(1);
    }
  }

  next(err);
};

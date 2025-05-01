import express from "express";
import SyrenityError from "../errors/BaseError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";
import Logger from "../util/Logger";
import config from "../config";

const logger = new Logger("error-handler");

export default (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (err) {
    if (
      err instanceof SyrenityError ||
      err instanceof AuthenticationError ||
      err instanceof DatabaseError
    ) {
      return res.status(err.statusCode).send(err.extract());
    } else if (config.errors.killOnNonSyrenityError) {
      logger.error(`Non-syrenity error thrown! Stopping.`);
      console.log(err);
      process.exit(1);
    } else {
      logger.error(`Non-syrenity error thrown!`);
      console.log(err);
      return res.status(500).send(
        new SyrenityError({
          message: "Internal Server Error",
          statusCode: 500,
          errorCode: "UnknownServerError",
        }),
      );
    }
  }

  next(err);
};

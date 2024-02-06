import express from 'express';
import config from '../config.json';

/**
 * Handles PayloadTooLargeError errors
 */
export default (
  err: Error,
  _req: unknown,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Check if the error is a PayloadTooLargeError
  if (err.message.toString().startsWith("PayloadTooLargeError:")) {
    res.status(400).send({
      message: `Body exceeds size limit of ${config.server.body_limit}`
    });
  }

  // It is not
  next(err);
}
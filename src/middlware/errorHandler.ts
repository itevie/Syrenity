import express from 'express';
import config from '../config.json';
import ServerError from '../ServerError';

export default async function (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // Log the error
  console.error(err);

  const sendingData = {
    message: "Unknown Message",
    at: "unknown"
  };

  let statusCode = 500;
  
  // Handle it
  if (err instanceof ServerError) {
    // Get the message
    if (err.details.safeMessage)
      sendingData.message = err.details.safeMessage;
    else sendingData.message = err.details.message;

    // Get the at
    if (err.details.at)
      sendingData.at = err.details.at;

    // Check if there is a status code
    if (err.details.statusCode)
      statusCode = err.details.statusCode;
  }

  // Send the error
  return res.status(statusCode).send(sendingData);
}
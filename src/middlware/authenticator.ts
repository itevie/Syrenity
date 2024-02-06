import express from 'express';
import Ajv, { ValidateFunction } from 'ajv';
import ajvFormat from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import Logger from '../Logger';
import config from '../config.json';
import * as database from '../database';
import { routes } from '../util/loadRoutes';
import { RouteDetails } from '../types/route';
import validateURLParmeters from './authenticatorParts/validateURLParameters';
import validateURLQuery from './authenticatorParts/validateURLQuery';

const logger = new Logger("traffic");
const ajv = new Ajv({ allErrors: true, $data: true });
ajvFormat(ajv);
ajvErrors(ajv);

export interface AuthenticationError {
  message: string;
  at: string;
  status: number;
}

/**
 * Logs every request to the console
 */
export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    // Get URL
    const url = new URL("http://localhost:3000" + req.originalUrl);
    const routeName = `${req.method.toUpperCase()} ${url.pathname}`;

    // Try to find the route
    let route: RouteDetails | null = null;

    for (const i in routes) {
      const regex = new RegExp(`^(${i})$`);
      if (regex.exec(routeName)) {
        route = routes[i];
        break;
      }
    }

    // Only attempt to authenticate if the route was found
    if (!route) return next();

    // Check for authentication token
    if (req.headers["authorization"]) {
      let token = req.headers["authorization"];

      // Check if correct format
      if (!token.startsWith("Token "))
        return res.status(401).send({
          message: `Bad authorization: Invalid authorization type`,
          at: "headers.authorization"
        });
      
      token = token.replace("Token ", "");

      // Check if there is still a token
      if (!token)
        return res.status(401).send({
          message: "Bad authorization: Missing token",
          at: "headers.authorization"
        });

      // Check token
      const application = await database.actions.applications.fetchByToken(token);

      // Fetch user account
      const tempUser = await database.actions.users.fetch(application.bot_account);

      await req.login(tempUser, () => {});
      req.user = tempUser;
    }

    // Check if requires auth
    if (route.details?.auth) {
      if (route.details?.auth.loggedIn) {
        // Check if logged in
        if (!req.isAuthenticated()) {
          return res.status(401).send({
            message: "Not authorised"
          });
        }
      }
    }

    // Check if params are valid
    if (route.details?.params) {
      const valid = await validateURLParmeters(req, res, route.details?.params, req.user as User);

      // Check if was valid
      if (typeof valid != "boolean") {
        return res.status(valid.status).send({
          message: valid.message,
          at: valid.at,
        });
      }
    }

    // Check if query is valid
    if (route.details?.query) {
      const valid = validateURLQuery(req, res, route.details?.query);

      // Check if was valid
      if (typeof valid != "boolean") {
        return res.status(valid.status).send({
          message: valid.message,
          at: valid.at,
        });
      }
    }

    // Check if it needs body validating
    if (route.details?.body) {
      // Compile JSON schema
      const validate = ajv.compile(route.details.body.schema);

      // Check if it was valid  
      const valid = validate(req.body);
      if (!valid) {
        return res.status(400).send({
          message: "There are errors in the body of your request",
          errors: generateErrorFromSchemaErrors(validate)
        });
      }
    }

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
}

function generateErrorFromSchemaErrors(validate: ValidateFunction) {
  const errors: {[key: string]: any} = [];

  for (const i in validate.errors) {
    errors.push({
      message: validate.errors[i].message,
      at: validate.errors[i].instancePath.replace("/", "")
    });
  }

  return errors;
}

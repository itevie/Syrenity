import express from "express";
import { RouteDetails } from "../types/route";
import { routes } from "../util/routeManager";
import Ajv, { ValidateFunction } from "ajv";
import ajvFormat from "ajv-formats";
import ajvErrors from "ajv-errors";
import validateURLParameters from "./authenticatorValidateParamater";
import validatePermissions from "./authenticatorValidatePermissions";
import AuthenticationError from "../errors/AuthenticationError";
import database from "../database/database";
import SyUser from "../models/User";

const ajv = new Ajv({ allErrors: true, $data: true });
ajvFormat(ajv);
ajvErrors(ajv);

export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    // Get the url
    const url = new URL("http://localhost:3000" + req.originalUrl);
    const routeName = `${req.method.toUpperCase()} ${url.pathname}`;

    // Try to find the route
    let route: RouteDetails | null = null;

    for (const r in routes) {
      const regex = new RegExp(`^(${r})$`);
      if (regex.exec(routeName)) {
        route = routes[r];
        break;
      }
    }

    // Only attempt to authenticate if that route was found
    if (!route) return next();

    // Check for token authentication
    if (req.headers.authorization) {
      // Extract the token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Token ")) {
        return res.status(400).send(
          new AuthenticationError({
            message: `Invalid authorization format`,
            errorCode: "InvalidAuthorizationFormat",
            data: {
              expectedFormat: `Token token-here`,
            },
          }).extract(),
        );
      }
      const token = authHeader.split(" ")[1];

      // Check if existent
      if (!token) {
        return res.status(400).send(
          new AuthenticationError({
            message: `Invalid authorization format`,
            at: `header.authorization`,
            errorCode: "InvalidAuthorizationFormat",
            data: {
              expectedFormat: `Token token-here`,
            },
          }).extract(),
        );
      }

      // Try fetch the application
      try {
        const user = (await SyUser.fetchByToken(token)).fullData;
        req.login(user, () => {});
        req.user = user;
      } catch {
        return res.status(400).send(
          new AuthenticationError({
            message: `Invalid token`,
            errorCode: `InvalidToken`,
            at: `header.authorization`,
          }).extract(),
        );
      }
    }

    // Check for email and password in body
    if (
      req.body.email &&
      req.body.password &&
      route.path !== "/auth/register"
    ) {
      try {
        const user = await database.users.validateEmailPassword(
          req.body.email,
          req.body.password,
        );
        req.login(user, () => {});
        req.user = user;
      } catch {
        return res.status(401).send(
          new AuthenticationError({
            message: "Invalid email and password in body",
            errorCode: "InvalidEmailOrPassword",
          }).extract(),
        );
      }
    }

    // Check authentication
    if (route.auth) {
      // Check if needs to be logged in
      if (route.auth.loggedIn) {
        if (!req.user) {
          return res.status(401).send(
            new AuthenticationError({
              message: `You need to be logged in to access this resource`,
              errorCode: `NotLoggedIn`,
            }).extract(),
          );
        }
      }

      // CHeck if session only
      if (route.auth.sessionOnly) {
        if (req.headers.authorization)
          return res.status(401).send(
            new AuthenticationError({
              message: `You must be accessing this resource via a browser session`,
              errorCode: "SessionsOnly",
            }).extract(),
          );
      }
    }

    // Validation
    if (req.params) {
      const error = await validateURLParameters(req, res, route.params || {});

      // Check if it was valid
      if (error) {
        return res.status(error.data?.statusCode || 400).send(error.extract());
      }
    }

    // Check if body needs to be validated
    if (route.body) {
      // Compile JSON schema
      const validate = ajv.compile(route.body);

      // Check if it was valid
      const valid = validate(req.body);
      if (!valid) {
        return res.status(400).send(
          new AuthenticationError({
            message: `There are errors in the body of your request`,
            errorCode: "InvalidBody",
            data: {
              errors: generateErrorFromSchemaErrors(validate),
            },
          }).extract(),
        );
      }
    }

    // Check if permissions need to be validated
    if (route.permissions) {
      const error = await validatePermissions(req, res, route.permissions);

      if (error) {
        return res.status(error.data.statusCode || 400).send(error.extract());
      }
    }

    next();
  } catch (err) {
    console.error(`Authentication error: `);
    console.error(err);
    next(err);
  }
};

function generateErrorFromSchemaErrors(validate: ValidateFunction) {
  const errors: { [key: string]: any } = [];

  for (const i in validate.errors) {
    errors.push({
      message: validate.errors[i].message,
      at: validate.errors[i].instancePath.replace("/", ""),
    });
  }

  return errors;
}

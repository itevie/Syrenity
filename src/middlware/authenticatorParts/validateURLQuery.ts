import express from "express";
import { ParameterDetails, QueryDetails, RouteDetails } from "../../types/route";
import * as database from '../../database';
import * as permissions from '../../util/permissions';
import { AuthenticationError } from "../authenticator";

export default function validateURLQuery(req: express.Request, res: express.Response, query: {[key: string]: QueryDetails}): AuthenticationError | true {
  for (const i in query) {
    const part = query[i];

    // Check if it is optional and it isn't defined
    if (part.optional === true && !req.query[i]) {
      // Use default options if provided
      if (part.default) {
        req.query[i] = part.default as any;
      }

      continue;
    }

    // Check if it is NOT optional and isn't defined
    if (!req.query[i]) {
      return {
        message: `Query ${i} is not optional`,
        at: `query.${i}`,
        status: 400,
      }
    }

    let workingWith: string | number | boolean = req.query[i] as string;

    // Check if it is of the right type
    if (part.type) {
      if (part.type == "integer") {
        if (isNaN(parseInt(req.query[i] as string)) || (req.query[i] as string).length > 10) {
          return {
            message: `Query ${i} must be of type integer`,
            at: `query.${i}`,
            status: 400
          };
        }

        workingWith = parseInt(req.query[i] as string);
      } else if (part.type == "boolean") {
        if (req.query[i] !== "true" && req.query[i] !== "false") {
          return {
            message: `Query ${i} must be of type boolean`,
            at: `query.${i}`,
            status: 400,
          };
        }

        workingWith = req.query[i] === "true" ? true : false;
      }
    }

    // Check if there are valid options
    if (part.options) {
      if (part.options.includes(workingWith as never) == false) {
        return {
          message: `Query ${i} is not a valid option, valid options are: ${part.options.join(", ")}`,
          at: `query.${i}`,
          status: 400
        };
      }
    }
  }

  return true;
}
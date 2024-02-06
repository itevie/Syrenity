import express from "express";
import { ParameterDetails, RouteDetails } from "../../types/route";
import * as database from '../../database';
import * as permissions from '../../util/permissions';
import { AuthenticationError } from "../authenticator";

export default async function validateURLParmeters(req: express.Request, res: express.Response, params: {[key: string]: ParameterDetails}, user: User): Promise<boolean | AuthenticationError> {
  // Loop through the wanted params
  for (const i in params) {
    const paramTest = params[i];
    let param = req.params[i];

    // Check the is
    if (paramTest.is) {
      // The param should be int
      if (isNaN(parseInt(param)) && (param !== "@me" && paramTest.is !== "user")) {
        return {
          message: `param ${i} must be of type integer (${paramTest.is})`,
          at: `param.${i}`,
          status: 400,
        };
      }

      switch (paramTest.is) {
        case "guild":
          // Check if guild exists
          const exists = await database.actions.guilds.exists(parseInt(param));

          if (exists === false) {
            return {
              message: `The guild ${param} does not exist`,
              at: `param.${i}`,
              status: 404,
            };
          }
          break;
        case "channel":
          // Check if the channel exists
          const channelExists = await database.actions.channels.exists(parseInt(param));

          if (channelExists === false)
            return {
              message: `The channel ${param} does not exist`,
              at: `param.${i}`,
              status: 404,
            }
          break;
        case "message":
          // Check if the channel exists
          const messageExists = await database.actions.messages.exists(parseInt(param));

          if (messageExists === false)
            return {
              message: `The message ${param} does not exist`,
              at: `param.${i}`,
              status: 404,
            }
          break;
        case "role":
          // Check if the role exists
          const roleExists = await database.actions.guilds.roles.exists(parseInt(param));
          if (!roleExists)
            return {
              message: `The role ${param} does not exist`,
              at: `param.${i}`,
              status: 404,
            }
            break;
        case "user":
          // Check if @me is required
          if (paramTest.mustBeSelf === true && (param != "@me" && param != (req.user as User)?.id.toString()))
            return {
              message: `@me must be used for this route`,
              at: `params.${i}`,
              status: 400
            };

          // Check if it is @me
          if (param === "@me" && !req.user) {
            return {
              message: `Used @me in parameter but there is no logged in user`,
              at: `params.${i}`,
              status: 400
            }
          } else if (param === "@me") {
            // Modify param
            param = "" + (req.user as User).id;
            req.params[i] = "" + (req.user as User).id;
          }

          // Check if user exists
          const userExists = await database.actions.users.exists(parseInt(param));

          if (!userExists) return {
            message: `The user ${param} does not exist`,
            at: `params.${i}`,
            status: 404
          }
          break;
      }

      // Check if it needs to be able to be seen by the user
      if (paramTest.canView) {
        // Check if user can view
        const canView = await permissions.canUserView(paramTest.is as "guild" | "channel", parseInt(param), user.id);

        if (canView == false) {
          return {
            message: `You do not have permission to view this ${paramTest.is}`,
            at: `param.${i}`,
            status: 401,
          }
        }
      }
    }
  }

  return true;
}
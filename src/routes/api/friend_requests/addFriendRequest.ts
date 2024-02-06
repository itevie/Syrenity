import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import * as ws from '../../../ws/ws';
import * as permissions from '../../../util/permissions';
import config from '../../../config.json';

export default {
  method: "PUT",
  path: "/api/users/:userId/relationships/:addId",
  handler: async (req, res) => {
    // Get the details
    const userId = parseInt(req.params.userId);
    const addId = parseInt(req.params.addId);

    // Check if the friend request already exists
    if (await database.actions.friendRequests.exists(userId, addId)) {
      return res.status(400).send({
        mesasge: `There is already a friend request sent to this user`,
        at: `params.addId`
      });
    }

    // Add the request
    await database.actions.friendRequests.add(addId, userId);

    return res.status(304).end();
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      userId: {
        is: "user",
        mustBeSelf: true,
      },
      addId: {
        is: "user",
      }
    },
  }
} as RouteDetails
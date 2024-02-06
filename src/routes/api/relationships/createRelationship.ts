import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "POST",
  path: "/api/users/:userId/relationships/:recipient",
  handler: async (req, res) => {
    // Collect the users from url
    const userId = parseInt(req.params.userId);
    const recipient = parseInt(req.params.recipient);

    // Check if the relationship already exists
    if (await database.actions.relationships.exists(userId, recipient))
      return res.status(401).send({
        message: `The relationship between ${userId} and ${recipient} already exists`
      });

    // Create the relationship
    const relationship = await database.actions.relationships.createRelationship(userId, recipient);

    // Finished
    return res.status(200).send(relationship);
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      userId: {
        is: 'user',
        mustBeSelf: true,
      },
      recipient: {
        is: "user",
      }
    }
  }
} as RouteDetails
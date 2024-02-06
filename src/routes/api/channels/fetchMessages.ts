import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/channels/:id/messages",
  handler: async (req, res) => {
    // Fetch messages
    let messages = await database.actions.channels.messages.fetch(
      parseInt(req.params.id),
      {
        amount: parseInt(req.query.amount as string),
        startAt: parseInt(req.query.start_at as string) || null
      }
    );

    // TODO: Fill out all the messages

    // Reverse them if query wants that
    if (req.query.sort_by === "asc")
      messages = messages.reverse();

    // Finish
    return res.status(200).send({
      messages,
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },

    params: {
      id: {
        is: "channel",
        canView: true,
      }
    },

    query: {
      amount: {
        type: 'integer',
        default: 20,
        optional: true,
      },

      start_at: {
        type: 'integer',
        optional: true,
      },

      sort_by: {
        type: 'string',
        options: ["asc", "desc"],
        optional: true,
        default: "asc"
      }
    }
  }
} as RouteDetails
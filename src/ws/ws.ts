import expressWs from "express-ws";
import * as uuid from 'uuid';
import Logger from "../Logger";
import WebsocketConnection from "./WebsocketHandler";
import * as database from '../database';

const logger = new Logger("ws");
const connections = new Map<
  string,
  {
    uuid: string,
    ws: WebsocketConnection,
    user: User
  }
>();

export async function sendMessage(data: WSSendMessageOptions) {
  logger.log(`Broadcasting WS message: ${data.type}`);

  // Check if the channel is a relationsip
  let memberIDs: number[] = [];
  if (data.channelId && await database.actions.relationships.isRelationship(data.channelId)) {
    const relationship = await database.actions.relationships.fetchByChannelId(data.channelId);
    memberIDs = [relationship.user1, relationship.user2];
  } else {
    const members = await database.actions.guilds.members.fetchAll(data.guildId);
    memberIDs = members.map(x => x.user_id);
  }
  
  // Fetch the message IDs

  // Construct sending data
  const sendingData: {op: number, t: string, d: {[key: string]: any}} = {
    op: 0,
    t: data.type,
    d: {}
  };

  // Basic data
  if (data.message)
    sendingData.d.message = data.message;
  if (data.data) {
    for (const i in data.data) {
      sendingData.d[i] = data.data[i];
    }
  }

  // Broadcast message
  for (const [_, connection] of connections) {
    // Check if it should be broadcast to this connection
    if (memberIDs.includes(connection.user.id) == false)
      continue;

    // Send the data TODO: Add more security
    connection.ws.send(sendingData);
  }
}

/**
 * Initialises the Websocket part of the server
 * @param app 
 */
export function initialise(app: expressWs.Application) {
  /* Send dummy message
  setInterval(() => {
    sendMessage({
      guildId: 1,
      channelId: 34,
      type: "MESSAGE_CREATE",
      message: {
        id: 100000 + Math.floor(Math.random() * 100000),
        content: `Hello! ${Math.random()}`,
        channel_id: 34,
        is_edited: true,
        is_pinned: false,
        created_at: new Date(),
        author_id: 33,
      }
    });
  }, 1000);*/

  app.ws("/", async (ws, req) => {
    // Generate details
    const id = uuid.v4();
    logger.log(`New connection, ID: ${id}`);

    const wsConnection = new WebsocketConnection(id, ws, logger);
    // Check if the user is not authenticated yet
    if (!req.user) {
      // Create the callback function for once they have authenticated
      const onceAuthenticated = (user: User) => {
        // Re-initiate the WS connection
        wsConnection.init({
          uuid: id,
          awaitingAuthentication: false,
          user,
        });

        // Set in active connections
        connections.set(id, {
          uuid: id,
          ws: wsConnection,
          user
        });
      }

      // Initiate the WS for authentication
      wsConnection.init({
        uuid: id,
        awaitingAuthentication: true,
        onceAuthenticated
      });
    } else {
      // The user is already logged in, fetch the complete user details
      const user = await database.actions.users.fetchFull((req.user as User).id);

      // Set the connection
      connections.set(id, {
        uuid: id,
        ws: wsConnection,
        user,
      });

      // Initiate the WS as already authenticated
      wsConnection.init({
        uuid: id,
        user,
        awaitingAuthentication: false,
      });
    }

    // Handle closing events as the WebsocketHandler does not do that
    ws.onclose =() => {
      // Try fetch the connection
      const connection = connections.get(id);

      // Check if the connection was in the connections list
      if (connection) {
        logger.log(`${id} disconnect`);
      }
    }
  });
}
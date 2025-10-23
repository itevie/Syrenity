import config from "../config";
import SyChannel from "../models/Channel";
import SyMessage from "../models/Message";
import { send } from "../ws/websocketUtil";
import { SystemMessageTypes } from "./SystemMessageTypes";

export async function createSystemMessage<T extends keyof SystemMessageTypes>(
  channel: number,
  type: T,
  data: SystemMessageTypes[T],
): Promise<void> {
  // Create the message
  let message = await SyMessage.create({
    content: JSON.stringify(data),
    isSystem: true,
    systemType: type,
    authorId: config.system.id,
    channelId: channel,
  });

  // Broadcast to WS
  send({
    channel: channel,
    guild: (await SyChannel.fetch(channel)).data.guild_id,
    type: "MessageCreate",
    payload: {
      message: await message.expand(),
    },
  });
}

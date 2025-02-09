import { actions } from "../util/database";
import { send } from "../ws/websocketUtil";
import { SystemMessageTypes } from "./SystemMessageTypes";

export const systemUserID = -1;

export async function createSystemMessage<T extends keyof SystemMessageTypes>(channel: number, type: T, data: SystemMessageTypes[T]): Promise<void> {
    // Create the message
    let message = await actions.messages.create({
        content: JSON.stringify(data),
        isSystem: true,
        systemType: type,
        authorId: systemUserID,
        channelId: channel,
    });

    // Broadcast to WS
    send({
        channelId: channel,
        guildId: (await actions.channels.fetch(channel)).guild_id,
        type: "MessageCreate",
        data: {
            message,
        }
    });
}
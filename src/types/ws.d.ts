type WSSendType = "MESSAGE_CREATE"
  | "MESSAGE_DELETE"
  | "MESSAGE_UPDATE"
  | "CHANNEL_CREATE"
  | "GUILD_UPDATE"
  | "TYPING_START";

interface WSSendMessageOptions {
  guildId: number;
  channelId?: number;
  messageId?: number;
  message?: Message;
  channel?: Channel;
  type: WSSendType;
  data?: {[key: string]: any};
  noDuplicateUsers?: string;
}

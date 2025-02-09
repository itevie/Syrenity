export interface WebsocketDispatchTypes {
  // ----- Users -----
  UserUpdate: {
    user: User;
  };

  // ----- Messages -----
  MessageCreate: {
    message: Message;
  };

  MessageDelete: {
    messageId: number;
    channelId: number;
  };

  MessageEdit: {
    message: Message;
  };

  // ----- Members -----
  GuildMemberAdd: {
    member: Member;
  };

  // ----- Channels -----
  ChannelUpdate: {
    channel: Channel;
  };

  ChannelCreate: {
    channel: Channel;
  };

  ChannelDelete: {
    channelId: number;
    guildId: number;
  };
}

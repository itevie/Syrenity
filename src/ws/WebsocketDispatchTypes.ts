export interface WebsocketDispatchTypes {
  MessageCreate: {
    message: Message;
  };

  MessageDelete: {
    messageId: number;
  };

  GuildMemberAdd: {
    member: Member;
  };
}

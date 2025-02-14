import { DatabaseChannel } from "../models/Channel";
import { DatabaseMember } from "../models/Member";
import { ExpandedMessage } from "../models/Message";
import { DatabaseReaction } from "../models/Reaction";
import { DatabaseUser, StrippedDatabaseUser } from "../models/User";

export interface WebsocketDispatchTypes {
  MessageCreate: {
    message: Message;
  };

  MessageDelete: {
    message_id: number;
  };

  MessageUpdate: {
    message: Message;
  };

  ServerMemberAdd: {
    member: DatabaseMember;
  };

  ServerMemberRemove: {
    member: DatabaseMember;
  };

  ChannelCreate: {
    channel: DatabaseChannel;
  };

  ChannelDelete: {
    channel_id: number;
  };

  ChannelUpdate: {
    channel: DatabaseChannel;
  };

  ChannelPositionUpdate: {
    channels: number[];
  };

  UserUpdate: {
    user: StrippedDatabaseUser;
  };

  MessageReactionAdd: {
    reaction: DatabaseReaction;
    new_message: ExpandedMessage;
  };

  MessageReactionRemove: {
    reaction: DatabaseReaction;
    new_message: ExpandedMessage;
  };
}

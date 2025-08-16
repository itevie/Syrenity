import { DatabaseChannel } from "../models/Channel";
import { DatabaseMember } from "../models/Member";
import { ExpandedMessage } from "../models/Message";
import { DatabaseReaction } from "../models/Reaction";
import { DatabaseServer } from "../models/Servers";
import { DatabaseUser, StrippedDatabaseUser } from "../models/User";

export interface WebsocketDispatchTypes {
  MessageCreate: {
    message: ExpandedMessage;
  };

  MessageDelete: {
    message_id: number;
  };

  MessageUpdate: {
    message: ExpandedMessage;
  };

  ServerMemberAdd: {
    member: DatabaseMember;
  };

  ServerMemberRemove: {
    member: DatabaseMember;
  };

  ServerUpdate: {
    server: DatabaseServer;
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

  ChannelStartTyping: {
    channel_id: number;
    user_id: number;
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

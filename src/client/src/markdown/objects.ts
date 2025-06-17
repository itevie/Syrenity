export type ObjectType = "mention";

export interface MessageObjectBase {
  type: ObjectType;
}

export interface MessageMentionObject extends MessageObjectBase {
  type: "mention";
  userId: number;
  isEveryone: boolean;
}

type MessageObject = MessageMentionObject;
export default MessageObject;

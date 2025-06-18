export type ObjectType = "mention" | "file";

export interface MessageObjectBase {
  type: ObjectType;
}

export interface MessageMentionObject extends MessageObjectBase {
  type: "mention";
  userId: number;
  isEveryone: boolean;
}

export interface MessageFileObject extends MessageObjectBase {
  type: "file";
  fileId: string;
}

type MessageObject = MessageMentionObject | MessageFileObject;
export default MessageObject;

export type ObjectType = "mention" | "file" | "link";

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

export interface MessageLinkObject extends MessageObjectBase {
  type: "link";
  url: string;
}

type MessageObject =
  | MessageMentionObject
  | MessageFileObject
  | MessageLinkObject;
export default MessageObject;

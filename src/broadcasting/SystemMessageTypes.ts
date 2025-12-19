export interface SystemMessageTypes {
  MessagePinned: {
    pinned_by: number;
    message_id: number;
  };
  MemberJoin: {
    user_id: number;
  };
}

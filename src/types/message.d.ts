interface Message {
  id: number;
  channel_id: number;
  content: string;
  created_at: Date;
  author_id: number;
  is_pinned: boolean;
  is_edited: boolean;
}

/*
interface Message extends PartialMessage {
  guild_id: number;
  attachments?: Attachment[];
}
*/
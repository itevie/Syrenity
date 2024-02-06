interface Channel {
  id: number;
  type: 'dm' | 'channel' | 'category';
  guild_id: number;
  name: string;
  topic: string;
}

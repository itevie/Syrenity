// TODO: Move to their respective model class file

interface Application {
  id: number;
  token: string;
  application_name: string;
  bot_account: number;
  owner_id: number;
  created_at: Date;
}

interface AssignedRole {
  user_id: number;
  role_id: number;
  guild_id: number;
}

type ChannelType = "dm" | "channel" | "category";

interface Channel {
  id: number;
  type: ChannelType;
  guild_id: number;
  name: string;
  topic: string;
}

interface ChannelFull extends Channel {
  role_overrides: ChannelRoleOverride[];
}

interface ChannelRoleOverride {
  channel_id: number;
  role_id: number;
  bitfield_allow: number;
  bitfield_deny: number;
}

interface SyFile {
  id: string;
  created_at: Date;
  file_name: string;
  original_url: string | null;
  is_deleting: boolean;
  mime: string | null;
}

interface Invite {
  id: string;
  guild_id: number;
  channel_id: number | null;
  created_by: number;
  created_at: Date;
  expires_in: number | null;
  max_uses: number | null;
  uses: number;
}

interface Member {
  guild_id: number;
  user_id: number;
  nickname: string;
}

interface MemberFull extends Member {
  roles: Role[];
}

interface Message {
  id: number;
  channel_id: number;
  content: string;
  created_at: Date;
  author_id: number;
  is_pinned: number;
  is_edited: number;
  is_system: boolean;
  sys_type: string | null;
}

interface Relationship {
  channel_id: number;
  user1: number;
  user2: number;
  last_message: Date;
  active: boolean;
}

interface Role {
  id: number;
  guild_id: number;
  name: string;
  bitfield_allow: number;
  bitfield_deny: number;
  is_everyone: boolean;
  color: string;
  rank: number;
}

interface Server {
  id: number;
  name: string;
  owner_id: number;
  description: string;
  avatar: string;
}

interface Token {
  token: string;
  account: number;
  created_at: Date;
  identifier: string | null;
}

interface User {
  id: number;
  username: string;
  discriminator: number;
  avatar: string;
  created_at: Date;
  is_bot: boolean;
  bio: string;
}

interface FullUser extends User {
  email: string;
  email_verified: boolean;
  password: string;
  "2fa_secret": string;
}

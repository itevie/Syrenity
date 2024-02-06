interface User {
  id: number;
  password: string;
  username: string;
  discriminator: number;
  avatar: string;
  '2fa_secret': string;
  created_at: Date;
  is_bot: boolean;
  settings: UserSettings;
  bio: string;
  email: string;
  email_verified: boolean;
}

interface PartialUser {
  id: number;
  username: string;
  discriminator: number;
  avatar: string;
  created_at: Date;
  is_bot: boolean;
  bio: string;
}

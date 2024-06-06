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
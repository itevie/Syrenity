interface Invite {
    guild_id: number,
    created_at: Date,
    created_by: number,
    expires: Date | null,
    id: string,
}
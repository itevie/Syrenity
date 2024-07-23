interface Invite {
    id: string,
    guild_id: number,
    channel_id: number | null,
    created_by: number,
    created_at: Date,
    expires_in: number | null,
    max_uses: number | null,
    uses: number,
}
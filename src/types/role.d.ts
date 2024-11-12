interface Role {
    id: number,
    guild_id: number,
    name: string,
    bitfield_allow: number,
    bitfield_deny: number,
    is_everyone: boolean,
    color: string,
    rank: number,
}
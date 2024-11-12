interface Member {
    guild_id: number,
    user_id: number,
    nickname: string,
}

interface MemberFull extends Member {
    roles: Role[]
}
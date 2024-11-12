type ChannelType = "dm" | "channel" | "category";

interface Channel {
    id: number,
    type: ChannelType,
    guild_id: number,
    name: string,
    topic: string,
}

interface ChannelFull extends Channel {
    role_overrides: ChannelRoleOverride[],
}
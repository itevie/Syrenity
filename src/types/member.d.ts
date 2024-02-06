interface Member {
  guild_id: number;
  user_id: number;
  nickname: string;
}

interface MemberExtended extends Member {
  permissions_bitfield: number;
}
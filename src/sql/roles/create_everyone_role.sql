INSERT
  INTO roles
    (name, guild_id, permissions_bitfield, is_everyone)
  VALUES ('everyone', $1, $2, true)
  RETURNING *
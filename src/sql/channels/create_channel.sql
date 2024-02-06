INSERT INTO channels(type, guild_id, name)
  VALUES ('channel', $1, $2)
  RETURNING *
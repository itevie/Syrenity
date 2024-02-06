SELECT 1
  FROM members
  WHERE guild_id = $1
  AND user_id = $2;
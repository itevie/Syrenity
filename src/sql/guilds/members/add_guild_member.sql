INSERT INTO members (guild_id, user_id)
    VALUES ($1, $2)
    RETURNING *
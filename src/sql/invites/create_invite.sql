INSERT INTO invites (guild_id, created_at, created_by)
    VALUES ($1, CURRENT_TIMESTAMP, $2)
    RETURNING *
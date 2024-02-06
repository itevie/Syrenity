INSERT INTO guilds (name, avatar, owner_id)
    VALUES ($1, $2, $3)
    RETURNING *
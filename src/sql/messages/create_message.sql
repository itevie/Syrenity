INSERT INTO messages (channel_id, author_id, created_at, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *
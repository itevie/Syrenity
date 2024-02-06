-- $1 = channel ID $2 = how many
SELECT * FROM messages
    WHERE channel_id = $1
    ORDER BY created_at DESC
    LIMIT $2
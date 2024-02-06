-- $1 = channel ID $2 = how many $3 = at where it should start
SELECT * FROM messages
    WHERE channel_id = $1 AND id < $3
    ORDER BY created_at DESC
    LIMIT $2
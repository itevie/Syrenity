INSERT INTO relationships (channel_id, user1, user2, last_message, active)
    VALUES ($1, $2, $3, CURRENT_DATE, true)
    RETURNING * 
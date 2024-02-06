SELECT 1 FROM relationships
    WHERE (user1 = $1 AND user2 = $2)
        OR (user1 = $2 AND user2 = $1)
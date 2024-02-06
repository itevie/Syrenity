SELECT * FROM relationships
    WHERE user1 = $1 
        AND user2 = $2 
        AND active = true
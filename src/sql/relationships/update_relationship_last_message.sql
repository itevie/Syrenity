UPDATE relationships
	SET last_message = $3
	WHERE user1 = $1 AND user2 = $2
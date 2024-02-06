SELECT * FROM relationships 
	WHERE (user1 = $1 
		OR user2 = $1) AND active = true
	ORDER BY last_message DESC
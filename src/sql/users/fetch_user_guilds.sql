WITH guild_ids AS (
	SELECT guild_id
	FROM members
	WHERE user_id = $1
)

SELECT * 
	FROM guilds 
	WHERE (
		SELECT 1 
			FROM guild_ids 
			WHERE guild_id = guilds.id
	) = 1
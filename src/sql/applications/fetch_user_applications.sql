SELECT *
  FROM users
  WHERE (
    SELECT 1
      FROM applications
      WHERE applications.owner_id = $1
        AND applications.bot_account = users.id
  ) = 1
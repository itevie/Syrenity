-- Fetches a user by their email
SELECT *
  FROM users
  WHERE email = $1
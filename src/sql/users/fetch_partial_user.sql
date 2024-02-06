-- Fetches only the required details of a user
SELECT 
    id, username, discriminator, avatar, is_bot, created_at 
  FROM users
  WHERE id = $1
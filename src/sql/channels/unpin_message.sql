UPDATE messages
  SET is_pinned = false
  WHERE id = $1
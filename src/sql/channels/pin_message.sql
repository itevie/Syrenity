UPDATE messages
  SET is_pinned = true
  WHERE id = $1
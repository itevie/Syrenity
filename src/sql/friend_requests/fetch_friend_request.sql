SELECT * FROM friend_requests
  WHERE (
    (for_user = $1 AND by_user = $2)
    OR (for_user = $2 AND by_user = $1)
  )
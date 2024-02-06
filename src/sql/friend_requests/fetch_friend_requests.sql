SELECT * FROM friend_requests
  WHERE (for_user = $1 OR by_user = $1)
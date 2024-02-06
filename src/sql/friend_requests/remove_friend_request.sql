DELETE FROM friend_requests
  WHERE for_user = $1
    AND by_user = $2;
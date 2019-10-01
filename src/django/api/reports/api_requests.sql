-- Count the number of API requests made each month.
-- Exclude requests made by users with openapparel.org or azavea.com email
-- addresses.

SELECT
  CAST (date_part('month', l.created_at) AS int) AS month,
  COUNT(*) AS api_request_count
FROM api_requestlog l
JOIN api_user u ON l.user_id = u.id
WHERE date_part('month', l.created_at) < date_part('month', now())
AND NOT u.email LIKE '%openapparel.org%'
AND NOT u.email LIKE '%azavea.com%'
GROUP BY date_part('month', l.created_at)
ORDER BY date_part('month', l.created_at);

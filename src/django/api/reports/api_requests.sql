-- Count the number of API requests made each month.
-- Exclude requests made by users with openapparel.org or azavea.com email
-- addresses.

SELECT
  to_char(l.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS api_request_count
FROM api_requestlog l
JOIN api_user u ON l.user_id = u.id
WHERE to_char(l.created_at, 'YYYY-MM') < to_char(now(), 'YYYY-MM')
AND NOT u.email LIKE '%openapparel.org%'
AND NOT u.email LIKE '%azavea.com%'
GROUP BY to_char(l.created_at, 'YYYY-MM')
ORDER BY to_char(l.created_at, 'YYYY-MM');

SELECT
  to_char(l.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS list_count
FROM api_facilitylist l
WHERE replaces_id IS NOT NULL
AND to_char(l.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
GROUP BY to_char(l.created_at, 'YYYY-MM')
ORDER BY to_char(l.created_at, 'YYYY-MM');

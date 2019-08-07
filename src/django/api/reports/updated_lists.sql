SELECT
  CAST (date_part('month', l.created_at) AS int) AS month,
  COUNT(*) AS list_count
FROM api_facilitylist l
WHERE replaces_id IS NOT NULL
AND date_part('month', l.created_at) != date_part('month', now())
GROUP BY date_part('month', l.created_at)
ORDER BY date_part('month', l.created_at);

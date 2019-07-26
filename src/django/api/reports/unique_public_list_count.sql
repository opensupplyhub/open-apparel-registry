SELECT
  CAST (month AS int),
  COUNT(*) AS list_count
FROM (
  SELECT DISTINCT
    min(date_part('month', l.created_at)) AS month,
    c.id
  FROM api_facilitylist l
  JOIN api_contributor c ON L.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE date_part('month', l.created_at) != date_part('month', now())
  AND u.email LIKE '%openapparel.org%'
  GROUP BY c.id
) s
GROUP BY month
ORDER BY month;

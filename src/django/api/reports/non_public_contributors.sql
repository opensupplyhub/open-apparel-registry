SELECT
  CAST (month AS int),
  COUNT(*) AS contributor_count
FROM (
  SELECT DISTINCT
    date_part('month', l.created_at) AS month,
    c.id
  FROM api_facilitylist l
  JOIN api_contributor c ON l.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE date_part('month', l.created_at) != date_part('month', now())
  AND NOT u.email LIKE '%openapparel.org%'
  ORDER BY date_part('month', l.created_at), c.id
) s
GROUP BY month
ORDER BY month;

SELECT
  CAST (month AS int),
  round(avg(list_count), 2)
FROM (
  SELECT
    date_part('month', l.created_at) AS month,
    c.id,
    COUNT(*) AS list_count
  FROM api_facilitylist l
  JOIN api_contributor c ON c.id = l.contributor_id
  WHERE date_part('month', l.created_at) != date_part('month', now())
  AND l.is_public = 't'
  AND l.is_active = 't'
  GROUP BY date_part('month', l.created_at), c.id
) s
GROUP BY month
ORDER BY month;

SELECT
  CAST (month AS int),
  round(avg(list_count), 2)
FROM (
  SELECT
    date_part('month', l.created_at) AS month,
    c.id,
    COUNT(*) AS list_count
  FROM api_facilitylist l
  JOIN api_source s ON s.facility_list_id = l.id
  JOIN api_contributor c ON c.id = s.contributor_id
  WHERE date_part('month', l.created_at) != date_part('month', now())
  AND s.is_public = 't'
  AND s.is_active = 't'
  GROUP BY date_part('month', l.created_at), c.id
) s
GROUP BY month
ORDER BY month;

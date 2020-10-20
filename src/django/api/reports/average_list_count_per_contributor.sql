SELECT
  month,
  round(avg(list_count), 2)
FROM (
  SELECT
    to_char(l.created_at, 'YYYY-MM') AS month,
    c.id,
    COUNT(*) AS list_count
  FROM api_facilitylist l
  JOIN api_source s ON s.facility_list_id = l.id
  JOIN api_contributor c ON c.id = s.contributor_id
  WHERE to_char(l.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  AND s.is_public = 't'
  AND s.is_active = 't'
  AND s.create = 't'
  GROUP BY to_char(l.created_at, 'YYYY-MM'), c.id
) s
GROUP BY month
ORDER BY month;

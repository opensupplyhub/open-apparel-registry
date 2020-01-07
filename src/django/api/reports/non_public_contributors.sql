SELECT
  month,
  COUNT(*) AS contributor_count
FROM (
  SELECT DISTINCT
    to_char(l.created_at, 'YYYY-MM') AS month,
    c.id
  FROM api_facilitylist l
  JOIN api_source s ON s.facility_list_id = l.id
  JOIN api_contributor c ON s.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE to_char(l.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  AND NOT u.email LIKE '%openapparel.org%'
  ORDER BY to_char(l.created_at, 'YYYY-MM'), c.id
) s
GROUP BY month
ORDER BY month;

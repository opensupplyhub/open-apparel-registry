SELECT
  month,
  contrib_type AS contributor_type,
  COUNT(*) AS contributor_count
FROM (
  SELECT distinct
    min(to_char(l.created_at, 'YYYY-MM')) AS month,
    c.id,
    c.contrib_type
  FROM api_facilitylist l
  JOIN api_source s ON s.facility_list_id = l.id
  JOIN api_contributor c ON s.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE to_char(l.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  AND NOT u.email like '%openapparel.org%'
  GROUP BY c.id, c.contrib_type
) s
GROUP BY month, contrib_type
ORDER BY month, contrib_type;

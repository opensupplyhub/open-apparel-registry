SELECT
  month,
  contrib_type AS contributor_type,
  COUNT(*) AS contributor_count
FROM (
  SELECT distinct
    min(to_char(s.created_at, 'YYYY-MM')) AS month,
    c.id,
    c.contrib_type
  FROM api_source s
  JOIN api_contributor c ON s.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE to_char(s.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  AND s.create = true
  AND NOT u.email like '%openapparel.org%'
  AND NOT u.email like '%azavea.com%'
  GROUP BY c.id, c.contrib_type
) q
GROUP BY month, contrib_type
ORDER BY month, contrib_type;

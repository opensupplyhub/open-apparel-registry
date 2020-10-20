SELECT
  month,
  name
FROM (
  SELECT DISTINCT
    min(to_char(s.created_at, 'YYYY-MM')) AS month,
    c.id
  FROM api_source s
  JOIN api_contributor c ON s.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE to_char(s.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  AND s.create = 't'
  AND NOT u.email LIKE '%openapparel.org%'
  AND NOT u.email LIKE '%azavea.com%'
  GROUP BY c.id
) s
JOIN api_contributor c ON c.id = s.id
ORDER BY month, c.id, c.name;

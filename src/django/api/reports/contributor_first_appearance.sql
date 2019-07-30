SELECT
  CAST (month AS int),
  name
from (
  SELECT DISTINCT
    min(date_part('month', l.created_at)) AS month,
    c.id
  FROM api_facilitylist l
  JOIN api_contributor c ON l.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE date_part('month', l.created_at) != date_part('month', now())
  AND NOT u.email LIKE '%openapparel.org%'
  GROUP BY c.id
) s
JOIN api_contributor c ON c.id = s.id
ORDER BY month, c.id, c.name;

SELECT
  CAST (month AS int),
  contrib_type AS contributor_type,
  COUNT(*) AS contributor_count
FROM (
  SELECT distinct
    min(date_part('month', l.created_at)) AS month,
    c.id,
    c.contrib_type
  FROM api_facilitylist l
  JOIN api_contributor c ON l.contributor_id = c.id
  JOIN api_user u ON u.id = c.admin_id
  WHERE date_part('month', l.created_at) != date_part('month', now())
  AND NOT u.email like '%openapparel.org%'
  GROUP BY c.id, c.contrib_type
) s
GROUP BY month, contrib_type
ORDER BY month, contrib_type;

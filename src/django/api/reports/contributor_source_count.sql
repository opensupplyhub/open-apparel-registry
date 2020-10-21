SELECT
  c.name,
  s.source_type,
  COUNT(*) AS source_count
FROM api_source s
JOIN api_contributor c ON s.contributor_id = c.id
JOIN api_user u ON u.id = c.admin_id
WHERE s.create = 't'
GROUP BY c.name, s.source_type
ORDER BY COUNT(*) DESC;

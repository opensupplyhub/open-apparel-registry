SELECT
  c.name,
  COUNT(*) AS list_count
FROM api_facilitylist l
JOIN api_contributor c ON l.contributor_id = c.id
JOIN api_user u ON u.id = c.admin_id
GROUP BY c.name
ORDER BY COUNT(*) DESC;

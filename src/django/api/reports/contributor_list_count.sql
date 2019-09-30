SELECT
  c.name,
  COUNT(*) AS list_count
FROM api_facilitylist l
JOIN api_source s ON s.facility_list_id = l.id
JOIN api_contributor c ON s.contributor_id = c.id
JOIN api_user u ON u.id = c.admin_id
GROUP BY c.name
ORDER BY COUNT(*) DESC;

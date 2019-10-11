SELECT
  CAST (date_part('month', l.created_at) AS int) AS month,
  CASE WHEN u.email LIKE '%openapparel.org%' THEN 'y' ELSE 'n' END AS is_public_list,
  COUNT(*) AS list_count
FROM api_facilitylist l
JOIN api_source s ON s.facility_list_id = l.id
JOIN api_contributor c ON s.contributor_id = c.id
JOIN api_user u ON u.id = c.admin_id
WHERE date_part('month', l.created_at) != date_part('month', now())
GROUP BY date_part('month', l.created_at), is_public_list
ORDER BY date_part('month', l.created_at), is_public_list;

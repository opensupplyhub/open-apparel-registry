SELECT
  to_char(l.created_at, 'YYYY-MM') AS month,
  CASE WHEN (u.email LIKE '%openapparel.org%'
             OR u.email LIKE '%opensupplyhub.org%')
       THEN 'y' ELSE 'n' END AS is_public_list,
  COUNT(*) AS list_count
FROM api_facilitylist l
JOIN api_source s ON s.facility_list_id = l.id
JOIN api_contributor c ON s.contributor_id = c.id
JOIN api_user u ON u.id = c.admin_id
WHERE to_char(l.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
GROUP BY to_char(l.created_at, 'YYYY-MM'), is_public_list
ORDER BY to_char(l.created_at, 'YYYY-MM'), is_public_list;

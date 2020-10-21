-- Count the number of facility list CSV rows uploaded each month.

SELECT
  to_char(i.created_at, 'YYYY-MM') AS month,
  CASE WHEN u.email LIKE '%openapparel.org%' THEN 'y' ELSE 'n' END AS is_public_list,
  COUNT(*) AS item_count
  FROM api_facilitylistitem i
         JOIN api_source s on i.source_id = s.id
         JOIN api_contributor c ON s.contributor_id = c.id
         JOIN api_user u ON u.id = c.admin_id
 WHERE to_char(i.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
 AND s.create = true
 GROUP BY to_char(i.created_at, 'YYYY-MM'), is_public_list
 ORDER BY to_char(i.created_at, 'YYYY-MM'), is_public_list;

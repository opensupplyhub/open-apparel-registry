-- Count the number of facility list CSV rows uploaded each month.

SELECT
  CAST (date_part('month', i.created_at) AS int) AS month,
  CASE WHEN u.email LIKE '%openapparel.org%' THEN 'y' ELSE 'n' END AS is_public_list,
  COUNT(*) AS item_count
  FROM api_facilitylistitem i
         JOIN api_facilitylist l on i.facility_list_id = l.id
         JOIN api_contributor c ON l.contributor_id = c.id
         JOIN api_user u ON u.id = c.admin_id
 WHERE date_part('month', i.created_at) != date_part('month', now())
 GROUP BY date_part('month', i.created_at), is_public_list
 ORDER BY date_part('month', i.created_at), is_public_list;

SELECT
  email,
  name,
  date(u.created_at) AS registration_date,
  regexp_replace(description, E'[\\n\\r]+', ' ', 'g' ) AS description,
  contrib_type,
  website,
  should_receive_newsletter
FROM api_user u
JOIN api_contributor c ON u.id = c.admin_id
AND u.email NOT LIKE '%openapparel.org%'
ORDER BY u.created_at, email

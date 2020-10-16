SELECT
  u.email,
  c.name,
  date(u.created_at) AS registration_date,
  regexp_replace(c.description, E'[\\n\\r]+', ' ', 'g' ) AS description,
  c.contrib_type,
  c.website,
  u.should_receive_newsletter
FROM api_contributor c
JOIN api_user u ON u.id = c.admin_id
WHERE c.id IN (
  SELECT contributor_id
  FROM api_source
  WHERE is_active = true
  AND is_public = true
  AND "create" = true
  AND id IN (
    SELECT source_id
    FROM api_facilitylistitem
    WHERE status NOT IN ('ERROR', 'ERROR_PARSING', 'ERROR_GEOCODING', 'ERROR_MATCHING')
  )
)
AND u.email NOT LIKE '%openapparel.org%'
ORDER BY u.created_at, email

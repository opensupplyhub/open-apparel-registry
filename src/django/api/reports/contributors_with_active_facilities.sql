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
INNER JOIN api_source s ON (c.id = s.contributor_id)
WHERE s.id IN (
    SELECT V0.id
      FROM api_source V0
     WHERE (V0.is_active = true AND V0.is_public = true AND NOT (V0.id IN (SELECT U1.source_id FROM api_facilitylistitem U1 WHERE U1.status IN ('ERROR', 'ERROR_PARSING', 'ERROR_GEOCODING', 'ERROR_MATCHING'))))
 )
AND u.email NOT LIKE '%openapparel.org%'
ORDER BY u.created_at, email

SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS error_count
FROM api_facilitylistitem li
JOIN api_source s ON li.source_id = s.id
WHERE li.status = 'ERROR_GEOCODING'
AND s.create = 't'
GROUP BY to_char(li.created_at, 'YYYY-MM')
ORDER BY to_char(li.created_at, 'YYYY-MM');

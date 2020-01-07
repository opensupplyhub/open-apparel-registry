SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS error_count
  FROM api_facilitylistitem li
WHERE status = 'ERROR_GEOCODING'
GROUP BY to_char(li.created_at, 'YYYY-MM')
ORDER BY to_char(li.created_at, 'YYYY-MM');

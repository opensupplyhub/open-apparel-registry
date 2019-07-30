SELECT
  CAST (date_part('month', li.created_at) AS int) AS month,
  COUNT(*) AS error_count
FROM api_facilitylistitem li
WHERE status = 'ERROR_GEOCODING'
AND date_part('month', created_at) < date_part('month', now())
GROUP BY date_part('month', li.created_at)
ORDER BY date_part('month', li.created_at);

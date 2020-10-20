SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS list_item_count
FROM api_facilitylistitem li
JOIN api_source s ON li.source_id = s.id
WHERE status = 'ERROR_MATCHING'
AND s.create = true
AND to_char(li.created_at, 'YYYY-MM') < to_char(now(), 'YYYY-MM')
GROUP BY to_char(li.created_at, 'YYYY-MM')
ORDER BY to_char(li.created_at, 'YYYY-MM');

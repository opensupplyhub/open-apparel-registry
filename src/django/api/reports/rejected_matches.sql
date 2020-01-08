SELECT
  to_char(created_at, 'YYYY-MM') AS month,
  COUNT(*) AS match_count
FROM (
  SELECT
    facility_list_item_id,
    max(created_at) AS created_at
  FROM api_facilitymatch
  WHERE status = 'REJECTED'
  AND to_char(created_at, 'YYYY-MM') < to_char(now(), 'YYYY-MM')
  GROUP BY facility_list_item_id
) s
GROUP BY to_char(created_at, 'YYYY-MM')
ORDER BY to_char(created_at, 'YYYY-MM');

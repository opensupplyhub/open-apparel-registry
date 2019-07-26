SELECT
  CAST (date_part('month', created_at) AS int) AS month,
  COUNT(*) AS match_count
FROM (
  SELECT
    facility_list_item_id,
    max(created_at) AS created_at
  FROM api_facilitymatch
  WHERE status = 'REJECTED'
  AND date_part('month', created_at) < date_part('month', now())
  GROUP BY facility_list_item_id
) s
GROUP BY date_part('month', created_at)
ORDER BY date_part('month', created_at);

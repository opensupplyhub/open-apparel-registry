SELECT
  CAST (date_part('month', f.created_at) AS int) AS month,
  COUNT(*) AS match_count
FROM api_facilitymatch m
JOIN api_facility f ON m.facility_id = f.id
WHERE m.facility_list_item_id != f.created_from_id
AND status NOT IN ('REJECTED', 'PENDING')
AND date_part('month', f.created_at) < date_part('month', now())
GROUP BY date_part('month', f.created_at)
ORDER BY date_part('month', f.created_at);

SELECT
  to_char(f.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS match_count
  FROM api_facilitymatch m
JOIN api_facility f ON m.facility_id = f.id
WHERE m.facility_list_item_id != f.created_from_id
AND status NOT IN ('REJECTED', 'PENDING')
AND to_char(f.created_at, 'YYYY-MM') < to_char(now(), 'YYYY-MM')
GROUP BY to_char(f.created_at, 'YYYY-MM')
ORDER BY to_char(f.created_at, 'YYYY-MM');

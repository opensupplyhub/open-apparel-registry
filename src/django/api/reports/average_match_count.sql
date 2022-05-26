-- Average number of potential match addresses fed to a user during confirm/reject

SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  COUNT(*) as item_count,
  SUM(m.match_count) as match_count,
  ROUND(AVG(m.match_count), 2) AS average_match_count
  FROM (
    SELECT facility_list_item_id, COUNT(*) as match_count
      FROM api_facilitymatch
     GROUP BY facility_list_item_id
    ) m
       JOIN api_facilitylistitem li
              ON m.facility_list_item_id = li.id
 WHERE li.status IN ('CONFIRMED_MATCH', 'POTENTIAL_MATCH')
 GROUP BY to_char(li.created_at, 'YYYY-MM')
 ORDER BY to_char(li.created_at, 'YYYY-MM');

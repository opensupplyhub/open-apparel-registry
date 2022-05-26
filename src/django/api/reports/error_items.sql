-- Count the number of items in an error state each month

SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  COUNT(*) as item_count
  FROM api_facilitylistitem li
 WHERE li.status like 'ERROR%'
 GROUP BY to_char(li.created_at, 'YYYY-MM')
 ORDER BY to_char(li.created_at, 'YYYY-MM');

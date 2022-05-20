-- Count the number of potential mand and confirmed/rejected list itemss created each month

SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  SUM(CASE WHEN li.status = 'POTENTIAL_MATCH' THEN 1 ELSE 0 END) as open_count,
  SUM(CASE WHEN li.status = 'CONFIRMED_MATCH' THEN 1 ELSE 0 END) as confirmed_rejected_count
  FROM api_facilitylistitem li
 GROUP BY to_char(li.created_at, 'YYYY-MM')
 ORDER BY to_char(li.created_at, 'YYYY-MM');

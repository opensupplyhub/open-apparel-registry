SELECT
  to_char(li.created_at, 'YYYY-MM') AS month,
  COUNT(*) AS list_item_count
from api_facilitylistitem li
WHERE status = 'CONFIRMED_MATCH'
AND to_char(created_at, 'YYYY-MM') < to_char(now(), 'YYYY-MM')
GROUP BY to_char(li.created_at, 'YYYY-MM')
ORDER BY to_char(li.created_at, 'YYYY-MM');

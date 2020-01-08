SELECT
  to_char(created_at, 'YYYY-MM') AS month,
  COUNT(DISTINCT country_code) AS country_count
FROM (
  SELECT
    country_code,
    min(created_at) AS created_at
    FROM api_facility
    GROUP BY country_code
) s
GROUP BY to_char(created_at, 'YYYY-MM')
ORDER BY to_char(created_at, 'YYYY-MM');

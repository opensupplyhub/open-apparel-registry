SELECT
  CAST (date_part('month', created_at) AS int) AS month,
  COUNT(DISTINCT country_code) AS country_count
FROM (
  SELECT
    country_code,
    min(created_at) AS created_at
    FROM api_facility
    GROUP BY country_code
) s
GROUP BY date_part('month', created_at)
ORDER BY date_part('month', created_at);

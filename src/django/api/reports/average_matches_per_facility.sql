SELECT
  month,
  round(avg(match_count), 2) AS average_match_count
FROM (
  SELECT
    to_char(m.created_at, 'YYYY-MM') AS month,
    f.id,
    count(*) AS match_count
  FROM api_facilitymatch m
  JOIN api_facility f ON m.facility_id = f.id
  AND status NOT IN ('REJECTED', 'PENDING')
  AND to_char(m.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  GROUP BY to_char(m.created_at, 'YYYY-MM'), f.id
) s
GROUP BY month
ORDER BY month;

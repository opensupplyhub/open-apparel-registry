SELECT
  CAST (month AS int),
  round(avg(match_count), 2) AS average_match_count
FROM (
  SELECT
    date_part('month', m.created_at) AS month,
    f.id,
    count(*) AS match_count
  FROM api_facilitymatch m
  JOIN api_facility f ON m.facility_id = f.id
  AND status NOT IN ('REJECTED', 'PENDING')
  AND date_part('month', m.created_at) != date_part('month', now())
  GROUP BY date_part('month', m.created_at), f.id
) s
GROUP BY month
ORDER BY month;

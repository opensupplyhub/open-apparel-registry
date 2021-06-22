SELECT to_char(approved_at, 'YYYY-MM') as month, COUNT(*) as facilities_closed_in_month
FROM api_HistoricalFacilityActivityReport
WHERE status = 'CONFIRMED' AND closure_state = 'CLOSED'
GROUP BY month
ORDER BY month;

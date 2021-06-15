SELECT to_char(a.created_at, 'YYYY-MM') as month, COUNT(*) as duplicates_merged
FROM api_facilityalias a
WHERE reason = 'MERGE'
GROUP BY month
ORDER BY month;

-- Count the number of API tokens created each month.
-- NOTE: API tokens can be deleted by users, so the counts returned by this
-- report will change over time.

SELECT
  to_char(t.created, 'YYYY-MM') AS month,
  COUNT(*) AS token_count
FROM authtoken_token t
WHERE to_char(t.created, 'YYYY-MM') < to_char(now(), 'YYYY-MM')
GROUP BY to_char(t.created, 'YYYY-MM')
ORDER BY to_char(t.created, 'YYYY-MM');

-- Count the number of API tokens created each month.
-- NOTE: API tokens can be deleted by users, so the counts returned by this
-- report will change over time.

SELECT
  CAST (date_part('month', t.created) AS int) AS month,
  COUNT(*) AS token_count
FROM authtoken_token t
WHERE date_part('month', t.created) < date_part('month', now())
GROUP BY date_part('month', t.created)
ORDER BY date_part('month', t.created);

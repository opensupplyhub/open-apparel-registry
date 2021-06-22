SELECT month, COUNT(Distinct user_id)
FROM api_requestlog l
JOIN (
    SELECT to_char(created_at, 'YYYY-MM') as month
    FROM api_requestlog
    GROUP BY month
) as m on to_char(l.created_at, 'YYYY-MM') <= m.month
GROUP BY month
ORDER BY month;

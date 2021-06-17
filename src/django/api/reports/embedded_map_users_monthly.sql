SELECT month, count(*) as embedded_map_users
FROM api_embedconfig e
JOIN (
    SELECT to_char(created_at, 'YYYY-MM') as month
    FROM api_embedconfig
    GROUP BY month
) as m on to_char(e.created_at, 'YYYY-MM') <= m.month
GROUP BY month
ORDER BY month;

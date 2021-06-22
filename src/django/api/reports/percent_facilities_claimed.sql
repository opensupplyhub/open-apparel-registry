SELECT c.zmonth as month,
    c.approved_claims,
    t.total_facilities,
    ROUND(CAST((c.approved_claims*100) as decimal)/t.total_facilities, 2) as percent_of_facilities_claimed
FROM (
    SELECT
        COUNT(f.id) as approved_claims,
        z.month as zmonth,
        status
    FROM api_facility f
    JOIN (
        SELECT to_char(m.created_at, 'YYYY-MM') as month
        FROM api_facility m group by month
    ) z ON to_char(f.created_at, 'YYYY-MM') <= z.month
    LEFT JOIN (
        SELECT status, status_change_date, facility_id
        FROM api_facilityclaim
    ) as fc on f.id = fc.facility_id and to_char(status_change_date, 'YYYY-MM') <= z.month
    WHERE status = 'APPROVED'
    GROUP BY zmonth, status
) as c
JOIN (
    SELECT
        COUNT(f.id) as total_facilities,
        z.month as zmonth
    FROM api_facility f
    JOIN (
        SELECT to_char(m.created_at, 'YYYY-MM') as month
        FROM api_facility m group by month
    ) z ON to_char(f.created_at, 'YYYY-MM') <= z.month
    GROUP BY zmonth
) as t on t.zmonth = c.zmonth
WHERE status = 'APPROVED';

SELECT
    month,
    ROUND(AVG(match_count), 2) as average_matches
FROM (
    SELECT f.id, COUNT(*) as match_count, zmonth as month
    FROM api_facility f
    JOIN (
        SELECT DISTINCT
            c.id,
            fm.facility_id,
            to_char(fm.created_at, 'YYYY-MM') as created_month,
            z.month as zmonth
        FROM api_facilitymatch fm
        JOIN api_facilitylistitem i
        ON fm.facility_list_item_id = i.id
        JOIN api_source s
        ON i.source_id = s.id
        JOIN api_contributor c
        ON s.contributor_id = c.id
        JOIN (
            SELECT to_char(m.created_at, 'YYYY-MM') as month
            FROM api_facilitymatch m group by month
        ) z ON to_char(fm.created_at, 'YYYY-MM') <= z.month
        WHERE fm.status NOT IN ('PENDING', 'REJECTED')
    ) as fm ON f.id = fm.facility_id
    GROUP BY zmonth, f.id
) as c
GROUP BY month
ORDER BY month;

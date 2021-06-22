SELECT
    match.month,
    contrib_type,
    ROUND(CAST((COUNT(*)*100) as decimal)/total, 2) as percent_of_data,
    COUNT(*) as type_count,
    total
FROM (
    SELECT
        MIN(to_char(m.created_at, 'YYYY-MM')) AS month,
        contrib_type
    FROM api_facilitymatch m
        JOIN api_facilitylistitem i on m.facility_list_item_id = i.id
        JOIN api_source s on i.source_id = s.id
        JOIN api_contributor c ON s.contributor_id = c.id
        JOIN api_user u ON u.id = c.admin_id
    WHERE m.status NOT IN ('REJECTED', 'PENDING')
    AND u.email NOT LIKE '%openapparel.org%'
    GROUP BY m.facility_id, u.email, c.contrib_type
) as match
JOIN (
    SELECT month, count(*) as total
    FROM (
        SELECT
            MIN(to_char(m.created_at, 'YYYY-MM')) AS month
        FROM api_facilitymatch m
            JOIN api_facilitylistitem i on m.facility_list_item_id = i.id
            JOIN api_source s on i.source_id = s.id
            JOIN api_contributor c ON s.contributor_id = c.id
            JOIN api_user u ON u.id = c.admin_id
        WHERE m.status NOT IN ('REJECTED', 'PENDING')
        AND u.email NOT LIKE '%openapparel.org%'
        GROUP BY m.facility_id, u.email
    ) as fm
    GROUP BY month
    ORDER BY month
) t ON t.month = match.month
GROUP BY match.month, contrib_type, total
ORDER BY month;

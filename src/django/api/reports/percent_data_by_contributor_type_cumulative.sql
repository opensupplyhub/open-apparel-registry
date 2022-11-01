SELECT
    c.month,
    contrib_type,
    ROUND(CAST((type_count*100) as decimal)/total, 2) as percent_of_data,
    type_count,
    total
FROM (
    SELECT z.month, contrib_type, count(*) as type_count
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
        AND u.email NOT LIKE '%opensupplyhub.org%'
        GROUP BY m.facility_id, u.email, c.contrib_type
    ) as match
    JOIN (
        SELECT to_char(m.created_at, 'YYYY-MM') AS month
        FROM api_facilitymatch m
        GROUP BY month
    ) z on match.month <= z.month
    GROUP BY z.month, contrib_type
) c
JOIN (
    SELECT z.month, count(*) as total
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
        AND u.email NOT LIKE '%opensupplyhub.org%'
        GROUP BY m.facility_id, u.email
    ) as fm
    JOIN (
        SELECT to_char(m.created_at, 'YYYY-MM') AS month
        FROM api_facilitymatch m
        GROUP BY month
    ) z on fm.month <= z.month
    GROUP BY z.month
    ORDER BY z.month
) t on c.month = t.month
GROUP BY c.month, contrib_type, type_count, total
ORDER BY c.month;

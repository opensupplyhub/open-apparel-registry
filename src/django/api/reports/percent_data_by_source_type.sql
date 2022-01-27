-- Calculate the percentage of facilities submitted via API or List each month.
-- Only count the first instance of each unique combination of facility/contributor/source_type.

SELECT
    match.month,
    source_type,
    ROUND(CAST((COUNT(*)*100) as decimal)/total, 2) as percent_of_data
FROM (
    SELECT
        MIN(to_char(m.created_at, 'YYYY-MM')) AS month,
        source_type
    FROM api_facilitymatch m
        JOIN api_facilitylistitem i on m.facility_list_item_id = i.id
        JOIN api_source s on i.source_id = s.id
    WHERE m.status NOT IN ('REJECTED', 'PENDING')
    GROUP BY m.facility_id, s.contributor_id, s.source_type
) as match
JOIN (
    SELECT month, count(*) as total
    FROM (
        SELECT
            MIN(to_char(m.created_at, 'YYYY-MM')) AS month
        FROM api_facilitymatch m
            JOIN api_facilitylistitem i on m.facility_list_item_id = i.id
            JOIN api_source s on i.source_id = s.id
        WHERE m.status NOT IN ('REJECTED', 'PENDING')
        GROUP BY m.facility_id, s.contributor_id, s.source_type
    ) as fm
    GROUP BY month
    ORDER BY month
) t ON t.month = match.month
GROUP BY match.month, source_type, total;

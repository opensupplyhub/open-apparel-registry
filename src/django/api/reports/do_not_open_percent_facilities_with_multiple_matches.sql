SELECT zmonth as month,
       ROUND(CAST((facilities_with_multiple_matches*100) as decimal)/total_facilities, 2) as percent_of_data_with_multiple_matches,
       facilities_with_multiple_matches,
       total_facilities
FROM (
    SELECT
        zmonth,
        COUNT(CASE WHEN match_count > 1 THEN 1 ELSE NULL END) as facilities_with_multiple_matches,
        COUNT(*) AS total_facilities
    FROM (
        SELECT facility_id, COUNT(*) as match_count, zmonth
            FROM
                (
                SELECT
                    fm.facility_id,
                    z.month as zmonth
                FROM api_facilitymatch fm
                JOIN (
                    SELECT to_char(m.created_at, 'YYYY-MM') as month
                    FROM api_facilitymatch m group by month
                ) z ON to_char(fm.created_at, 'YYYY-MM') <= z.month
                JOIN api_facilitylistitem i ON i.id = fm.facility_list_item_id
                JOIN api_source s on i.source_id = s.id
                GROUP BY s.contributor_id, zmonth, fm.facility_id
            ) as f
        GROUP BY f.facility_id, zmonth
    ) as y
    GROUP BY zmonth
) as z

SELECT
  month,
  contrib_type AS contributor_type,
  round(avg(match_count), 2) AS average_match_count
FROM (
  SELECT
    to_char(m.created_at, 'YYYY-MM') AS month,
    f.id,
    COUNT(*) AS match_count,
    contrib_type
  FROM api_facilitymatch m
  JOIN api_facility f ON m.facility_id = f.id
  JOIN api_facilitylistitem li ON m.facility_list_item_id = li.id
  JOIN api_source s ON li.source_id = s.id
  JOIN api_facilitylist l ON s.facility_list_id = l.id
  JOIN api_contributor c ON c.id = s.contributor_id
  JOIN api_user u ON u.id = c.admin_id
  WHERE to_char(m.created_at, 'YYYY-MM') != to_char(now(), 'YYYY-MM')
  AND m.status not in ('REJECTED', 'PENDING')
  AND not u.email like '%openapparel.org%'
  AND not u.email like '%opensupplyhub.org%'
  GROUP BY to_char(m.created_at, 'YYYY-MM'), f.id, contrib_type
) s
GROUP BY month, contrib_type
ORDER BY month, contrib_type;

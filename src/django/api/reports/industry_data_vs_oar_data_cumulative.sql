SELECT
  z.month,
  ROUND(CAST(
            (COUNT(CASE WHEN fm.is_public_list THEN 1 ELSE NULL END)*100)
        as decimal)/COUNT(*), 2) AS oar_data,
  ROUND(CAST(
            (COUNT(CASE WHEN NOT fm.is_public_list THEN 1 ELSE NULL END)*100)
       as decimal)/COUNT(*), 2) AS industry_data,
  COUNT(CASE WHEN fm.is_public_list THEN 1 ELSE NULL END) as oar_count,
  COUNT(CASE WHEN NOT fm.is_public_list THEN 1 ELSE NULL END) as industry_count
  FROM (
      SELECT
          MIN(to_char(m.created_at, 'YYYY-MM')) AS month,
          u.email LIKE '%openapparel.org%' AS is_public_list,
          m.facility_id
      FROM api_facilitymatch m
          JOIN api_facilitylistitem i on m.facility_list_item_id = i.id
          JOIN api_source s on i.source_id = s.id
          JOIN api_contributor c ON s.contributor_id = c.id
          JOIN api_user u ON u.id = c.admin_id
      WHERE m.status NOT IN ('REJECTED', 'PENDING')
      GROUP BY m.facility_id, u.email
  ) as fm
  JOIN (
      SELECT to_char(m.created_at, 'YYYY-MM') AS month
      FROM api_facilitymatch m
      GROUP BY month
  ) z on fm.month <= z.month
 GROUP BY z.month
 ORDER BY z.month;

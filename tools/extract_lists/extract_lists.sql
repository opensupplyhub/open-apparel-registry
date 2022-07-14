COPY (
  SELECT s.contributor_id, lpad(l.id::text, 6, '0') as list_id, li.row_index, li.country_code, li.name, li.address, ST_X(li.geocoded_point) as lng, ST_Y(li.geocoded_point) as lat
  FROM api_facilitylistitem li
         JOIN api_source s ON li.source_id = s.id
         JOIN api_facilitylist l on s.facility_list_id = l.id
 WHERE s.source_type = 'LIST'
   AND s.is_active = true
   AND s.facility_list_id IS NOT NULL
   AND li.status IN ('MATCHED', 'CONFIRMED_MATCH')
 ORDER BY l.id, li.row_index
) TO STDOUT CSV HEADER FORCE QUOTE name, address;

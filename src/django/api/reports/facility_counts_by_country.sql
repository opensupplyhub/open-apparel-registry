SELECT
    country_code,
    COUNT(api_facility.id) AS facility_count
FROM api_facility
GROUP BY country_code
ORDER BY facility_count DESC

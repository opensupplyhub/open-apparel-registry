# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Update extended fields when matches are adjusted [#1544](https://github.com/open-apparel-registry/open-apparel-registry/pull/1544)
- Allow prefer contributor name in embed [#1557](https://github.com/open-apparel-registry/open-apparel-registry/pull/1557)
- Add new facility details sidebar [#1552](https://github.com/open-apparel-registry/open-apparel-registry/pull/1552)

### Changed

### Deprecated

### Removed

### Fixed

- Use newer version of terraform container to avoid CI error [#1566](https://github.com/open-apparel-registry/open-apparel-registry/pull/1566)

### Security

## [53] 2021-12-09

### Added

- Create ExtendedFields [#1527](https://github.com/open-apparel-registry/open-apparel-registry/pull/1527)
- Include ExtendedFields in Facility Details [#1530](https://github.com/open-apparel-registry/open-apparel-registry/pull/1530)
- Add extended profile feature flag [#1542](https://github.com/open-apparel-registry/open-apparel-registry/pull/1542)

### Fixed

- Fix broken geocoding test [#1546](https://github.com/open-apparel-registry/open-apparel-registry/pull/1546)
- Correctly position and size embed footer badge [#1547](https://github.com/open-apparel-registry/open-apparel-registry/pull/1547)

## [52] 2021-11-10

### Added

- Redirect to new info site [#1523](https://github.com/open-apparel-registry/open-apparel-registry/pull/1523)

### Fixed

- Correct info site routes [#1520](https://github.com/open-apparel-registry/open-apparel-registry/pull/1520)

## [51] 2021-11-04

### Added

- Add ExtendedFields model [#1503](https://github.com/open-apparel-registry/open-apparel-registry/pull/1503)

### Changed

- Update copy [#1515](https://github.com/open-apparel-registry/open-apparel-registry/pull/1515)
- Update My Lists link/copy [#1516](https://github.com/open-apparel-registry/open-apparel-registry/pull/1516)

## [50] 2021-10-28

### Fixed

- Fix 'More' Links [#1505](https://github.com/open-apparel-registry/open-apparel-registry/pull/1505)

## [49] 2021-10-27

### Added

- Add warning about inexact facility coordinates [#1488](https://github.com/open-apparel-registry/open-apparel-registry/pull/1488)
- Add endpoints for info website [#1487](https://github.com/open-apparel-registry/open-apparel-registry/pull/1487)

### Changed

- Update header, footer, and font [#1495](https://github.com/open-apparel-registry/open-apparel-registry/pull/1495)
- Provide access to info endpoints [#1499](https://github.com/open-apparel-registry/open-apparel-registry/pull/1499)
- Update and fix links [#1502](https://github.com/open-apparel-registry/open-apparel-registry/pull/1502)

## [48] 2021-10-08

### Added

- Add Geocoding Dashboard [#1469](https://github.com/open-apparel-registry/open-apparel-registry/pull/1469)
- Redirect to alias for deleted facilities [#1473](https://github.com/open-apparel-registry/open-apparel-registry/pull/1473)
- Add linkings IDs for relocated facilities [#1474](https://github.com/open-apparel-registry/open-apparel-registry/pull/1474)
- Add script to merge identified duplicates [#1477](https://github.com/open-apparel-registry/open-apparel-registry/pull/1477)

### Fixed

- Fix delete facility endpoint [#1472](https://github.com/open-apparel-registry/open-apparel-registry/pull/1472)
- Allow blank new_oar_ids [#1485](https://github.com/open-apparel-registry/open-apparel-registry/pull/1485)
- Fix invalid country/address combinations [#1482](https://github.com/open-apparel-registry/open-apparel-registry/pull/1482)

### Security

- Bump axios from 0.21.1 to 0.21.2 in /src/app [#1466](https://github.com/open-apparel-registry/open-apparel-registry/pull/1466)

## [47] 2021-09-14

### Added

- Allow users to transfer matches between facilities [#1464](https://github.com/open-apparel-registry/open-apparel-registry/pull/1464)

## [46] 2021-08-17

### Added

- Add custom marker colors [#1445](https://github.com/open-apparel-registry/open-apparel-registry/pull/1445)
- Add facility indexing [#1455](https://github.com/open-apparel-registry/open-apparel-registry/pull/1455)

### Changed

- Disable scrolling in embed mode [#1437](https://github.com/open-apparel-registry/open-apparel-registry/pull/1437)
- Update logo and copy [#1449](https://github.com/open-apparel-registry/open-apparel-registry/pull/1449)

### Fixed

- Fix mobile header [#1454](https://github.com/open-apparel-registry/open-apparel-registry/pull/1454)

## [45] 2021-07-21

### Added

- Integrate Mailchimp signup [#1412](https://github.com/open-apparel-registry/open-apparel-registry/pull/1412)
- Close all facilities on a list [#1429](https://github.com/open-apparel-registry/open-apparel-registry/pull/1429)

### Changed

- Conditionally hide remove button [#1417](https://github.com/open-apparel-registry/open-apparel-registry/pull/1417)
- Align logout button [#1420](https://github.com/open-apparel-registry/open-apparel-registry/pull/1420)
- Use contractual limit tracking [#1418](https://github.com/open-apparel-registry/open-apparel-registry/pull/1418)
- Handle error when splitting match w/o location [#1424](https://github.com/open-apparel-registry/open-apparel-registry/pull/1424)
- Make period_start_date editable [#1430](https://github.com/open-apparel-registry/open-apparel-registry/pull/1430)

### Fixed

- Anonymize other_locations contributors [#1415](https://github.com/open-apparel-registry/open-apparel-registry/pull/1415)
- Fix facility detail header [#1419](https://github.com/open-apparel-registry/open-apparel-registry/pull/1419)
- Fix facility history bug [#1421](https://github.com/open-apparel-registry/open-apparel-registry/pull/1421)
- Block users without contributors [#1426](https://github.com/open-apparel-registry/open-apparel-registry/pull/1426)
- Extend geocoding report results [#1428](https://github.com/open-apparel-registry/open-apparel-registry/pull/1428)

## [44] 2021-06-22

### Added

- Add new admin reports [#1391](https://github.com/open-apparel-registry/open-apparel-registry/pull/1391)
- Reorder contributor fields [#1398](https://github.com/open-apparel-registry/open-apparel-registry/pull/1398)
- Add additional new admin reports [#1399](https://github.com/open-apparel-registry/open-apparel-registry/pull/1399)
- Add cumulative versions of reports [#1405](https://github.com/open-apparel-registry/open-apparel-registry/pull/1405)

### Changed

- Consolidate contributor type options [#1395](https://github.com/open-apparel-registry/open-apparel-registry/pull/1395)

### Fixed

- Correct contributor types [#1397](https://github.com/open-apparel-registry/open-apparel-registry/pull/1397)
- Set a minimum height when using a 100% width embed [#1401](https://github.com/open-apparel-registry/open-apparel-registry/pull/1401)

### Security

- Bump ws from 6.2.1 to 6.2.2 in /src/app [#1383](https://github.com/open-apparel-registry/open-apparel-registry/pull/1383)

## [43] - 2021-06-11

### Added

- Conditionally change split operation to revert [#1386](https://github.com/open-apparel-registry/open-apparel-registry/pull/1386)

### Changed

- Update claim a facility [#1385](https://github.com/open-apparel-registry/open-apparel-registry/pull/1385)

### Fixed

- Remove state flag from useUpdateLeafletMapImperatively to avoid loop [#1393](https://github.com/open-apparel-registry/open-apparel-registry/pull/1393)
- Pass request as context to FacilitySerializer [#1396](https://github.com/open-apparel-registry/open-apparel-registry/pull/1396)

## [42] - 2021-06-02

### Added

- Download facilities list as Excel [#1293](https://github.com/open-apparel-registry/open-apparel-registry/pull/1293)
- Add scripts/console [#1295](https://github.com/open-apparel-registry/open-apparel-registry/pull/1295)
- Notify contributors when lists complete processing [#1290](https://github.com/open-apparel-registry/open-apparel-registry/pull/1290)
- Add Settings Page [#1290](https://github.com/open-apparel-registry/open-apparel-registry/pull/1298)
- Add Back Button to Facility Claims [#1307](https://github.com/open-apparel-registry/open-apparel-registry/pull/1307)
- Add models to persist embed config [#1304](https://github.com/open-apparel-registry/open-apparel-registry/pull/1304)
- Add API to get nonstandard fields for contributor [#1321](https://github.com/open-apparel-registry/open-apparel-registry/pull/1321)
- Add new admin reports [#1326](https://github.com/open-apparel-registry/open-apparel-registry/pull/1326)
- Connect embed section of settings page to API [#1329](https://github.com/open-apparel-registry/open-apparel-registry/pull/1329)
- Show custom facility fields when in embed mode [#1341](https://github.com/open-apparel-registry/open-apparel-registry/pull/1341)
- Add NonstandardFields model [#1340](https://github.com/open-apparel-registry/open-apparel-registry/pull/1340)
- Enable custom styles [#1348](https://github.com/open-apparel-registry/open-apparel-registry/pull/1348)
- Add contributor embed level field [#1349](https://github.com/open-apparel-registry/open-apparel-registry/pull/1349)
- Add full-width embedded map support [#1352](https://github.com/open-apparel-registry/open-apparel-registry/pull/1352)
- Embedded map settings changes [#1353](https://github.com/open-apparel-registry/open-apparel-registry/pull/1353)
- Disable PPE search in embed mode [#1364](https://github.com/open-apparel-registry/open-apparel-registry/pull/1364)
- Enable the default embed map custom fields by default [#1365](https://github.com/open-apparel-registry/open-apparel-registry/pull/1365)
- Allow IFrames [#1367](https://github.com/open-apparel-registry/open-apparel-registry/pull/1367)
- Prevent embedded map use without authorization [#1370](https://github.com/open-apparel-registry/open-apparel-registry/pull/1370)
- Show messages when the embed config is incomplete [#1376](https://github.com/open-apparel-registry/open-apparel-registry/pull/1376)
- Download and map changes for embed mode [#1378](https://github.com/open-apparel-registry/open-apparel-registry/pull/1378)
- Use contributor ID rather than user ID when building embed code [#1380](https://github.com/open-apparel-registry/open-apparel-registry/pull/1380)
- Disable claim a facility in embed mode [#1382](https://github.com/open-apparel-registry/open-apparel-registry/pull/1382)

### Changed

- Remove Sample Data and Update Registration Text [#1291](https://github.com/open-apparel-registry/open-apparel-registry/pull/1291)
- Update Dependencies [#1291](https://github.com/open-apparel-registry/open-apparel-registry/pull/1303)
- Update facility details API [#1333](https://github.com/open-apparel-registry/open-apparel-registry/pull/1333)
- Show footer in embed mode [#1339](https://github.com/open-apparel-registry/open-apparel-registry/pull/1339)
- Remove "show other contributor info" embed option and hide other contributor information in embed mode [#1342](https://github.com/open-apparel-registry/open-apparel-registry/pull/1342)
- Hide "filter by contributor type" control in embed mode [#1358](https://github.com/open-apparel-registry/open-apparel-registry/pull/1358)

### Removed

- Remove debug logging from has_active_block [#1296](https://github.com/open-apparel-registry/open-apparel-registry/pull/1296)

### Fixed

- Adjust settings so fast refresh works in development [#1284](https://github.com/open-apparel-registry/open-apparel-registry/pull/1284)
- Fix raw data formatting [#1343](https://github.com/open-apparel-registry/open-apparel-registry/pull/1343)
- Update embed permission check and return a detail message when returing 403 from an embed update [#1350](https://github.com/open-apparel-registry/open-apparel-registry/pull/1350)
- Hide translation element on embedded map [#1357](https://github.com/open-apparel-registry/open-apparel-registry/pull/1357)
- Returned merged facilities in contributor searches [#1369](https://github.com/open-apparel-registry/open-apparel-registry/pull/1369)

### Security

- Bump djangorestframework from 3.10.1 to 3.11.2 in /src/django [#1289](https://github.com/open-apparel-registry/open-apparel-registry/pull/1289)
- Bump ssri from 6.0.1 to 6.0.2 in /src/app [#1324](https://github.com/open-apparel-registry/open-apparel-registry/pull/1324)
- Bump dns-packet from 1.3.1 to 1.3.4 in /src/app [#1360](https://github.com/open-apparel-registry/open-apparel-registry/pull/1360)
- Bump hosted-git-info from 2.8.8 to 2.8.9 in /src/app [#1332](https://github.com/open-apparel-registry/open-apparel-registry/pull/1332)
- Bump lodash from 4.17.19 to 4.17.21 in /src/app [#1331](https://github.com/open-apparel-registry/open-apparel-registry/pull/1331)

## [2.41.1] - 2021-04-19

### Fixed

- Increase default gunicorn worker timeout [#1317](https://github.com/open-apparel-registry/open-apparel-registry/pull/1317)

## [2.41.0] - 2021-03-12

### Added

- Provide Constant Access to GDPR [#1279](https://github.com/open-apparel-registry/open-apparel-registry/pull/1279)

### Changed

- Use Craco and Prettier [#1271](https://github.com/open-apparel-registry/open-apparel-registry/pull/1271)

### Fixed

- Look up contributor via token when checking API blocks [#1280](https://github.com/open-apparel-registry/open-apparel-registry/pull/1280)

### Security

- Bump react-dev-utils from 11.0.3 to 11.0.4 in /src/app [#1281](https://github.com/open-apparel-registry/open-apparel-registry/pull/1281)

## [2.40.0] - 2021-03-10

### Added

- Add a management command to make CSVs from a CSV download [#1214](https://github.com/open-apparel-registry/open-apparel-registry/pull/1214)
- Add API for reporting a facility as closed or reopened [#1231](https://github.com/open-apparel-registry/open-apparel-registry/pull/1231)
- Confirm or reject status reports [#1235](https://github.com/open-apparel-registry/open-apparel-registry/pull/1235)
- Report Facility Status from Facility Details [#1239](https://github.com/open-apparel-registry/open-apparel-registry/pull/1239)
- Add Report Waffle Switch [#1246](https://github.com/open-apparel-registry/open-apparel-registry/pull/1246)
- Add Closure to CSV Download [#1249](https://github.com/open-apparel-registry/open-apparel-registry/pull/1249)
- Manage Embed Parameter [#1257](https://github.com/open-apparel-registry/open-apparel-registry/pull/1257)
- Send Notification of Facility Report Response [#1250](https://github.com/open-apparel-registry/open-apparel-registry/pull/1250)
- Render Appropriately in Embed Mode [#1260](https://github.com/open-apparel-registry/open-apparel-registry/pull/1260)
- Filter Facilities by List [#1264](https://github.com/open-apparel-registry/open-apparel-registry/pull/1264)
- Assign facilities in Holland the NL country code [#1278](https://github.com/open-apparel-registry/open-apparel-registry/pull/1278)

### Changed

- Rename Taiwan
  [#1234](https://github.com/open-apparel-registry/open-apparel-registry/pull/1234) [#1238](https://github.com/open-apparel-registry/open-apparel-registry/pull/1238)
- Update ecsmanage [#1240](https://github.com/open-apparel-registry/open-apparel-registry/pull/1240)

### Fixed

- Align Facility Matches [#1243](https://github.com/open-apparel-registry/open-apparel-registry/pull/1243)
- Update Reject Button Text [#1244](https://github.com/open-apparel-registry/open-apparel-registry/pull/1244)
- Fix vagrant provisioning failure by pinning pip python version [#1262](https://github.com/open-apparel-registry/open-apparel-registry/pull/1262)
- Fix list filtering [#1272](https://github.com/open-apparel-registry/open-apparel-registry/pull/1272)

### Security

- Bump elliptic from 6.5.3 to 6.5.4 in /src/app [#1277](https://github.com/open-apparel-registry/open-apparel-registry/pull/1277)

## [2.39.2] - 2021-02-38

### Added

- Add verbose debug logging to API block checking [#1274](https://github.com/open-apparel-registry/open-apparel-registry/pull/1274)

## [2.39.1] - 2021-02-02

### Added

- Add a management command to make CSVs from a CSV download [#1214](https://github.com/open-apparel-registry/open-apparel-registry/pull/1214)

### Fixed

- Only show cookie preferences for the logged in user [#1229](https://github.com/open-apparel-registry/open-apparel-registry/pull/1229)

## [2.39.0] - 2021-01-28

### Added

- Add page to manage cookie preferences [#1213](https://github.com/open-apparel-registry/open-apparel-registry/pull/1213)

## [2.38.3] - 2021-01-13

### Fixed

- Change monthly to yearly in API notification emails [#1211](https://github.com/open-apparel-registry/open-apparel-registry/pull/1211)

## [2.38.2] - 2021-01-12

### Changed

- Allow setting NOTIFICATION_EMAIL_TO from a deployment var [#1203](https://github.com/open-apparel-registry/open-apparel-registry/pull/1203)
- Admin updates to allow filtering the source admin list by type and contributor and search users [#1207](https://github.com/open-apparel-registry/open-apparel-registry/pull/1207)

### Fixed

- Fix S3 permissions to allow CloudFront logging [#1208](https://github.com/open-apparel-registry/open-apparel-registry/pull/1208)

## [2.38.1] - 2021-01-06

### Changed

- Remove ApiLimit monthly_limit and make yearly_limit non-null [#1198](https://github.com/open-apparel-registry/open-apparel-registry/pull/1198)

## [2.38.0] - 2021-01-06

### Added

- Scheduled check_api_limits invocation with Step Functions [#1193](https://github.com/open-apparel-registry/open-apparel-registry/pull/1193)

### Changed

- Add ApiBlock.yearly_limit to prepare for replacing monthly_limit [#1197](https://github.com/open-apparel-registry/open-apparel-registry/pull/1197)

### Security

- Bump ini from 1.3.5 to 1.3.7 in /src/app [#1188](https://github.com/open-apparel-registry/open-apparel-registry/pull/1188)
- Bump axios from 0.19.0 to 0.21.1 in /src/app [#1194](https://github.com/open-apparel-registry/open-apparel-registry/pull/1194)

## [2.37.1] - 2020-12-14

### Fixed

- Remove leading and trailing whitespace from country when parsing [#1184](https://github.com/open-apparel-registry/open-apparel-registry/pull/1184)
- Fix pending matches bug [#1189](https://github.com/open-apparel-registry/open-apparel-registry/pull/1189)

## [2.37.0] - 2020-11-24

### Added

- Add ApiBlock Dashboard [#1170](https://github.com/open-apparel-registry/open-apparel-registry/pull/1170)

### Changed

- Include confirm and reject urls in API response examples [#1180](https://github.com/open-apparel-registry/open-apparel-registry/pull/1180)

### Fixed

- Update facility claims when merging [#1181](https://github.com/open-apparel-registry/open-apparel-registry/pull/1181)

## [2.36.0] - 2020-11-09

### Added

- Add a dissociate API [#1156](https://github.com/open-apparel-registry/open-apparel-registry/pull/1156)
- Add an admin-only ApiBlock API [#1161](https://github.com/open-apparel-registry/open-apparel-registry/pull/1161)
- Add RequestMeter middleware [#1166](https://github.com/open-apparel-registry/open-apparel-registry/pull/1166)

### Changed

- Update the development environment to use PostgreSQL 12.4 [1146](https://github.com/open-apparel-registry/open-apparel-registry/pull/1146)
- Allow setting the contributor on a new ApiLimit [1159](https://github.com/open-apparel-registry/open-apparel-registry/pull/1159)
- Reenable survey popup [#1159](https://github.com/open-apparel-registry/open-apparel-registry/pull/1167)
- Update contribute page text [#1171](https://github.com/open-apparel-registry/open-apparel-registry/pull/1171)

## [2.35.0] - 2020-10-21

### Added

- Add ApiLimit and ApiBlock models [#1141](https://github.com/open-apparel-registry/open-apparel-registry/pull/1141)

### Changed

- Update `django-ecsmanage` to version 2.0.0 [1129](https://github.com/open-apparel-registry/open-apparel-registry/pull/1129)
- Update reports to consider sources and source.create [#1142](https://github.com/open-apparel-registry/open-apparel-registry/pull/1142)

## [2.34.0] - 2020-10-13

### Added

- Make it possible to modify the RDS DB parameter group [#1125](https://github.com/open-apparel-registry/open-apparel-registry/pull/1125)

### Fixed

- Always return accept/reject links with potential matches [#1131](https://github.com/open-apparel-registry/open-apparel-registry/pull/1131)

## [2.33.0] - 2020-10-07

### Changed

Directly connect health check to GazetteerCache and remove the use of threading in model training [#1117](https://github.com/open-apparel-registry/open-apparel-registry/pull/1117) [#1123](https://github.com/open-apparel-registry/open-apparel-registry/pull/1123)

## [2.32.0] - 2020-09-24

### Fixed

- Return distinct source names from the facility API [#1113](https://github.com/open-apparel-registry/open-apparel-registry/pull/1113)
- Exclude contributors if all sources are create=False [#1114](https://github.com/open-apparel-registry/open-apparel-registry/pull/1114)

## [2.31.1] - 2020-09-21

### Added

- Simulate tile server throughput with k6 load test [#1103](https://github.com/open-apparel-registry/open-apparel-registry/pull/1103)

### Fixed

- Apply `ST_Transform()` when `hex_grid` table is created [#1109](https://github.com/open-apparel-registry/open-apparel-registry/pull/1109)

## [2.31.0] - 2020-09-09

### Added

- Add trigram match on facility name fallback when matching via API [#1099](https://github.com/open-apparel-registry/open-apparel-registry/pull/1099)

### Security

- Bump http-proxy from 1.17.0 to 1.18.1 in /src/app [#1098](https://github.com/open-apparel-registry/open-apparel-registry/pull/1098)

## [2.30.0] - 2020-08-11

### Fixed

- Rework GazetteerCache [#1076](https://github.com/open-apparel-registry/open-apparel-registry/pull/1076)

## [2.29.0] - 2020-08-06

### Changed

- Update PPE fields when deactivating sources and matches or confirming/rejecting matches [#1069](https://github.com/open-apparel-registry/open-apparel-registry/pull/1069)

## [2.28.0] - 2020-07-30

### Changed

- Added tooltips if table cells exceed certain lengths [#1054](https://github.com/open-apparel-registry/open-apparel-registry/pull/1054)
- Add alternate country names [#1064](https://github.com/open-apparel-registry/open-apparel-registry/pull/1064)
- Expand ppe_product_types and ppe_contact_phone [#1067](https://github.com/open-apparel-registry/open-apparel-registry/pull/1067)

### Fixed

- Prevent crashing the parse job if ppe_product_types value too long [#1062](https://github.com/open-apparel-registry/open-apparel-registry/pull/1062)

### Security

- Bump lodash from 4.17.13 to 4.17.19 in /src/app [#1051](https://github.com/open-apparel-registry/open-apparel-registry/pull/1051)
- Bump elliptic from 6.4.1 to 6.5.3 in /src/app [#1066](https://github.com/open-apparel-registry/open-apparel-registry/pull/1066)

## [2.27.0] - 2020-07-29

### Added

- Add PPE-related model fields and API support [#1037](https://github.com/open-apparel-registry/open-apparel-registry/pull/1037)
- Show PPE fields on facility detail and include in CSV downloads [#1041](https://github.com/open-apparel-registry/open-apparel-registry/pull/1041)
- Add PPE filter checkbox to the facility search page [#1044](https://github.com/open-apparel-registry/open-apparel-registry/pull/1044)
- Include PPE product types in free text query [#1045](https://github.com/open-apparel-registry/open-apparel-registry/pull/1045)
- Update PPE filter checkbox label / allow viewing RequestLog in the Django admin / log matching traceback [#1049](https://github.com/open-apparel-registry/open-apparel-registry/pull/1049)
- Update PPE fields when matching, splitting, and merging [#1055](https://github.com/open-apparel-registry/open-apparel-registry/pull/1055)

### Changed

- Use popovers for help text and match PPE checkbox style to contributor overlap [#1059](https://github.com/open-apparel-registry/open-apparel-registry/pull/1059)

## [2.26.1] - 2020-07-28

- Log stack trace of exception raised during single item matching [95e27f2](https://github.com/open-apparel-registry/open-apparel-registry/commit/95e27f201618ad8cb6c652325eeeae6169cd4974)

## [2.26.0] - 2020-06-25

### Added

- Mobile optimization for map ui [#1023](https://github.com/open-apparel-registry/open-apparel-registry/pull/1023)
- Add country first appearance report [#1024](https://github.com/open-apparel-registry/open-apparel-registry/pull/1024)

### Security

- Bump websocket-extensions from 0.1.3 to 0.1.4 in /src/app [#1026](https://github.com/open-apparel-registry/open-apparel-registry/pull/1026)

## [2.25.0] - 2020-05-14

### Changed

- If there are multiple high quality matches choose exact string match [#1016](https://github.com/open-apparel-registry/open-apparel-registry/pull/1016)

## [2.24.0] - 2020-04-02

### Added

- Return contributor details from list API and include in CSV download [#1005](https://github.com/open-apparel-registry/open-apparel-registry/pull/1005)

## [2.23.2] - 2020-03-23

### Fixed

- Only count contributors with active public items for type count [#1002](https://github.com/open-apparel-registry/open-apparel-registry/pull/1002)

## [2.23.1] - 2020-03-20

### Fixed

- Include contributors if they have any active facilities [#999](https://github.com/open-apparel-registry/open-apparel-registry/pull/999)

## [2.23.0] - 2020-03-18

### Added

- Add a report that groups facility counts by country [#979](https://github.com/open-apparel-registry/open-apparel-registry/pull/979)
- Add confirmed matches to canonical facility list when matching [#964](https://github.com/open-apparel-registry/open-apparel-registry/pull/964)
- Add polygonal search [#969](https://github.com/open-apparel-registry/open-apparel-registry/pull/969)
- Add report that lists contributors with active lists
  [#990](https://github.com/open-apparel-registry/open-apparel-registry/pull/990) [#991](https://github.com/open-apparel-registry/open-apparel-registry/pull/991)

### Changed

- Zoom to search [#966](https://github.com/open-apparel-registry/open-apparel-registry/pull/966)
- Display number of contributors per type [#981](https://github.com/open-apparel-registry/open-apparel-registry/pull/981)
- Open to search on page load; show results count in tab bar [#985](https://github.com/open-apparel-registry/open-apparel-registry/pull/985)

### Fixed

- Ignore case for forgot-password email [#970](https://github.com/open-apparel-registry/open-apparel-registry/pull/970)
- Update 'parent company' label to 'parent company / supplier group' [#971](https://github.com/open-apparel-registry/open-apparel-registry/pull/971)
- Hide contributors with only errored facilities [#974](https://github.com/open-apparel-registry/open-apparel-registry/pull/974)
- Show automated GPS coordinates after update [#978](https://github.com/open-apparel-registry/open-apparel-registry/pull/978)
- Allow click through polygon after search
- Fix contributor types when no contributors are found [#989](https://github.com/open-apparel-registry/open-apparel-registry/pull/989)
- Prevent reload of facilities list on confirm [#993](https://github.com/open-apparel-registry/open-apparel-registry/pull/993)

### Security

- Bump acorn from 5.7.3 to 5.7.4 in /src/app [#992](https://github.com/open-apparel-registry/open-apparel-registry/pull/992)

## [2.22.0] - 2020-02-20

### Changed

- Use a nested query when filtering by contributor type [#954](https://github.com/open-apparel-registry/open-apparel-registry/pull/954)

## [2.21.1] - 2020-02-11

### Fixed

- Return the contributor admin ID when serializing other locations [#950](https://github.com/open-apparel-registry/open-apparel-registry/pull/950) [#952](https://github.com/open-apparel-registry/open-apparel-registry/pull/952)

## [2.21.0] - 2020-01-08

### Added

- Allow groups memberships to be changed in the Django admin [#934](https://github.com/open-apparel-registry/open-apparel-registry/pull/934)

### Fixed

- Update reports to properly handle multiple years [#938](https://github.com/open-apparel-registry/open-apparel-registry/pull/938)

### Security

- Bump handlebars from 4.1.2 to 4.5.3 [#932](https://github.com/open-apparel-registry/open-apparel-registry/pull/932)

## [2.20.0] - 2019-12-18

### Added

- Add filter option to search for contributor overlap [#925](https://github.com/open-apparel-registry/open-apparel-registry/pull/925)

### Fixed

- Fix FacilityList to string and serilization with no Source [#931](https://github.com/open-apparel-registry/open-apparel-registry/pull/931)

## [2.19.0] - 2019-11-20

### Changed

- Move the facility match confirm/reject API to allow single-item match handling [#918](https://github.com/open-apparel-registry/open-apparel-registry/pull/918/)

### Fixed

- Add a dissociate history event when list item is replaced [#919](https://github.com/open-apparel-registry/open-apparel-registry/pull/919)

## [2.18.0] - 2019-11-12

### Changed

- Train persistant Dedupe model on first app request [#905](https://github.com/open-apparel-registry/open-apparel-registry/pull/905/)
- List inactive or private sources by contributor type [#907](https://github.com/open-apparel-registry/open-apparel-registry/pull/907)
- Add can view full contributor detail flag/group [#910](https://github.com/open-apparel-registry/open-apparel-registry/pull/910)
- Add downloadable XLSX contributor template [#912](https://github.com/open-apparel-registry/open-apparel-registry/pull/912)

### Fixed

- Handle EmptyResultSet error raised by tile requests [#911](https://github.com/open-apparel-registry/open-apparel-registry/pull/911)

## [2.17.0] - 2019-11-04

### Added

- Add single facility submission endpoint [#896](https://github.com/open-apparel-registry/open-apparel-registry/pull/896)

### Changed

- Replace facility history feature switch with feature flag [#881](https://github.com/open-apparel-registry/open-apparel-registry/pull/881)
- Better accommodate outside contributors [#895](https://github.com/open-apparel-registry/open-apparel-registry/pull/895)
- Allow superusers to change the Contributor of a Source [#901](https://github.com/open-apparel-registry/open-apparel-registry/pull/901)

### Deprecated

### Removed

- Remove legacy API [#888](https://github.com/open-apparel-registry/open-apparel-registry/pull/888)

### Fixed

- Handle cases when Source contributor or facility_list are None [#903](https://github.com/open-apparel-registry/open-apparel-registry/pull/903)

### Security

## [2.16.0] - 2019-10-24

### Changed

- Implement Source model step 3 [#858](https://github.com/open-apparel-registry/open-apparel-registry/pull/858)

### Fixed

- Use a decimal value for opacity in App.css rather than percent [#891](https://github.com/open-apparel-registry/open-apparel-registry/pull/891)
- Fix AWS Batch submission to use Source ID [#893](https://github.com/open-apparel-registry/open-apparel-registry/pull/893)

## [2.15.0] - 2019-10-14

### Added

- Implement Source model step 2 [#857](https://github.com/open-apparel-registry/open-apparel-registry/pull/857)
- Add OAR survey dialog [#869](https://github.com/open-apparel-registry/open-apparel-registry/pull/869)
- Add People's Republic of China as alternate country name [#876](https://github.com/open-apparel-registry/open-apparel-registry/pull/876)

## [2.14.0] - 2019-10-11

### Added

- Add facility list items uploaded report [#865](https://github.com/open-apparel-registry/open-apparel-registry/pull/865)
- Implement Source model [#856](https://github.com/open-apparel-registry/open-apparel-registry/pull/856)

## [2.13.0] - 2019-10-07

### Added

- Add facility history API endpoint [#830](https://github.com/open-apparel-registry/open-apparel-registry/pull/830)

### Changed

- Include match association records in facility history list [#851](https://github.com/open-apparel-registry/open-apparel-registry/pull/851)
- Include facility claim data in facility history list [#852](https://github.com/open-apparel-registry/open-apparel-registry/pull/852)
- Enable Waffle switches when running resetdb [#859](https://github.com/open-apparel-registry/open-apparel-registry/pull/859)

### Fixed

- Check geocoded_point is not None when serializing other locations [#861](https://github.com/open-apparel-registry/open-apparel-registry/pull/861)
- Remove duplicate entries from other locations data [#860](https://github.com/open-apparel-registry/open-apparel-registry/pull/860)
- Fix facility history entry order [#862](https://github.com/open-apparel-registry/open-apparel-registry/pull/862)

### Security

## [2.12.0] - 2019-10-01

### Added

- Add update facility location dashboard page [#814](https://github.com/open-apparel-registry/open-apparel-registry/pull/814)
- Display other locations on facility details page [#827](https://github.com/open-apparel-registry/open-apparel-registry/pull/827)
- Add reports to count API requests and API token creation [#833](https://github.com/open-apparel-registry/open-apparel-registry/pull/833)

### Changed

- Restyle grid layer legend & show conditionally based on zoom level [#826](https://github.com/open-apparel-registry/open-apparel-registry/pull/826)
- Update guide tab text along with vector tile feature [#834](https://github.com/open-apparel-registry/open-apparel-registry/pull/834)

### Fixed

- Close Disambiguation Popup on Reset [#812](https://github.com/open-apparel-registry/open-apparel-registry/pull/812)
- Close Disambiguation Popup on New Search [#825](https://github.com/open-apparel-registry/open-apparel-registry/pull/825)
- Change "Accept" to "Confirm" in About/Processing [#815](https://github.com/open-apparel-registry/open-apparel-registry/pull/815)
- Regularize vector tile map zoom behavior [#799](https://github.com/open-apparel-registry/open-apparel-registry/pull/799)
- Fix a bug which caused the vector tile map to crash on login/logout [#837](https://github.com/open-apparel-registry/open-apparel-registry/pull/837)
- Remove Visual Artifacts from the Vector Grid [#839](https://github.com/open-apparel-registry/open-apparel-registry/pull/839)

## [2.11.0] - 2019-09-12

### Added

- Adjust marker icon on selecting a new facility on the vector tiles layer [#749](https://github.com/open-apparel-registry/open-apparel-registry/pull/749)
- Fetch next page of facilities while scrolling through sidebar list [#750](https://github.com/open-apparel-registry/open-apparel-registry/pull/750)
- Enable signed-in users to download all facilities results as CSV [#752](https://github.com/open-apparel-registry/open-apparel-registry/pull/752)
- Add disambiguation marker to work with vector tile layer [#760](https://github.com/open-apparel-registry/open-apparel-registry/pull/760)
- Make facilities tab primary & load all facilities by default when vector tile feature is switched on [#771](https://github.com/open-apparel-registry/open-apparel-registry/pull/771)
- Add facility grid layer [#755](https://github.com/open-apparel-registry/open-apparel-registry/pull/755)
- Encode querystring params into tile cache key used by client to request vector tiles [#773](https://github.com/open-apparel-registry/open-apparel-registry/pull/773)
- Cache vector tiles for a year [#776](https://github.com/open-apparel-registry/open-apparel-registry/pull/776)

### Changed

- Use PostgreSQL 10.9 in development [#751](https://github.com/open-apparel-registry/open-apparel-registry/pull/751)
- Add open graph meta tags for social media sharing [#780](https://github.com/open-apparel-registry/open-apparel-registry/pull/780/files)
- Restrict `/tile` Endpoint to Allowed Hosts Only [#791](https://github.com/open-apparel-registry/open-apparel-registry/pull/791)
- Redesign facility grid layer [#797](https://github.com/open-apparel-registry/open-apparel-registry/pull/797)
- Set minimum map zoom level to 2 [#802](https://github.com/open-apparel-registry/open-apparel-registry/pull/802)

### Removed

- Drop undocumented endpoint from Swagger docs [#803](https://github.com/open-apparel-registry/open-apparel-registry/pull/803)

### Fixed

- Fix a bug which prevented the facility claims dashboard page header from loading [#778](https://github.com/open-apparel-registry/open-apparel-registry/pull/778)
- Fix a bug which prevented the vector tile marker layer from rendering [#782](https://github.com/open-apparel-registry/open-apparel-registry/pull/782)
- Capture infinite-scroll emitted bug in an ErrorBoundary in order not to crash the map component [#777](https://github.com/open-apparel-registry/open-apparel-registry/pull/777)
- Correct Facility Parent Company link [#772](https://github.com/open-apparel-registry/open-apparel-registry/pull/772)
- Escape newline and double-quote characters when downloading CSVs [#809](https://github.com/open-apparel-registry/open-apparel-registry/pull/809)

### Security

- Fix several npm security vulnerabilities via GitHub dependabot [#792](https://github.com/open-apparel-registry/open-apparel-registry/pull/792)

## [2.10.0] - 2019-08-22

### Added

- Add vector tile ADR [#723](https://github.com/open-apparel-registry/open-apparel-registry/pull/723)
- Add contributor and mailing list admin reports and the ability to download admin reports [#726](https://github.com/open-apparel-registry/open-apparel-registry/pull/726)
- Create `/tile` endpoint to return all facilities as vector tiles, along with React components for displaying the vector tiles [#730](https://github.com/open-apparel-registry/open-apparel-registry/pull/730)

### Fixed

- Restore django-waffle admin pages [#732](https://github.com/open-apparel-registry/open-apparel-registry/pull/732)
- Prevent map crash by not using strict equality when comparing point coordinates [#737](https://github.com/open-apparel-registry/open-apparel-registry/pull/737)
- Fix map marker anchor location [#745](https://github.com/open-apparel-registry/open-apparel-registry/pull/745)

## [2.9.0] - 2019-08-07

### Added

- Add admin reports [#709](https://github.com/open-apparel-registry/open-apparel-registry/pull/709)

### Changed

- Require authentication for facility CSV downloads and log requests [#697](https://github.com/open-apparel-registry/open-apparel-registry/pull/697)
- Wrap facility search results with react-infinite via react-infininte-any-height [#711](https://github.com/open-apparel-registry/open-apparel-registry/pull/711)
- Replace Google Map component with a React Leaflet component using a Google basemap [#710](https://github.com/open-apparel-registry/open-apparel-registry/pull/710)

### Fixed

- Pan map on selecting a new facility only when the selected facility is off-screen [#719](https://github.com/open-apparel-registry/open-apparel-registry/pull/719)

## [2.8.0] - 2019-07-24

### Added

- Enable admins to promote matches to become the canonical facility [#695](https://github.com/open-apparel-registry/open-apparel-registry/pull/695)

### Changed

- Upgrade Django to 2.2, along with upgrading some related libraries [#676](https://github.com/open-apparel-registry/open-apparel-registry/pull/676)

### Deprecated

### Removed

### Fixed

- Set Swagger API docs header [#694](https://github.com/open-apparel-registry/open-apparel-registry/pull/694)

### Security

## [2.7.0] - 2019-07-17

### Added

- Enable administrators to split facility matches into new facilities [#633](https://github.com/open-apparel-registry/open-apparel-registry/pull/633)
- Log requests made with token authentication [#646](https://github.com/open-apparel-registry/open-apparel-registry/pull/646)
- `./scripts/resetdb` to expedite refreshing application data during development [#672](https://github.com/open-apparel-registry/open-apparel-registry/pull/672)
- Enable searching by OAR ID from the facility search tab [#675](https://github.com/open-apparel-registry/open-apparel-registry/pull/675)

### Changed

- Require a token for all API endpoints [#644](https://github.com/open-apparel-registry/open-apparel-registry/pull/644)
- Validate claimed facility website field and show as hyperlink [#647](https://github.com/open-apparel-registry/open-apparel-registry/pull/647)
- Update app text in claim a facility workflow [#642](https://github.com/open-apparel-registry/open-apparel-registry/pull/642)
- Make "Dashboard" text on dashboard screens a clickable link [#667](https://github.com/open-apparel-registry/open-apparel-registry/pull/667)
- Display RouteNotFound component for unmatched routes [#657](https://github.com/open-apparel-registry/open-apparel-registry/pull/657)
- Add disclaimer text for claimed facility details [#670](https://github.com/open-apparel-registry/open-apparel-registry/pull/670)
- Update claim a facility form and profile fields [#650](https://github.com/open-apparel-registry/open-apparel-registry/pull/650)
- Add facility field changes to contributor notification emails [#649](https://github.com/open-apparel-registry/open-apparel-registry/pull/649)
- Add affiliations and certifications fields to claimed facility profile [#671](https://github.com/open-apparel-registry/open-apparel-registry/pull/671)
- Add product and production type to claimed facility profile [#680](https://github.com/open-apparel-registry/open-apparel-registry/pull/680)
- Make facility description required on claim a facility form [#679](https://github.com/open-apparel-registry/open-apparel-registry/pull/679)
- Adjust how product and production type options are set for claimed details profile form [#684](https://github.com/open-apparel-registry/open-apparel-registry/pull/684)

### Fixed

- Use a loop and `save` rather than `update` [#666](https://github.com/open-apparel-registry/open-apparel-registry/pull/666)
- Allow non-signed-in users to see API docs [#690](https://github.com/open-apparel-registry/open-apparel-registry/pull/690)

## [2.6.0] - 2019-06-25

### Added

- Enable submitting claim a facility form [#540](https://github.com/open-apparel-registry/open-apparel-registry/pull/540)
- Allow contributors to be verified [#563](https://github.com/open-apparel-registry/open-apparel-registry/pull/563)
- Add routing to enable users to view claimed facilities [#572](https://github.com/open-apparel-registry/open-apparel-registry/pull/572)
- Add claim a facility dashboard [#559](https://github.com/open-apparel-registry/open-apparel-registry/pull/559)
- Add profile page and update form for approved facility claims [#575](https://github.com/open-apparel-registry/open-apparel-registry/pull/575)
- Show a list of facilities successfully claimed by the current contributor [#573](https://github.com/open-apparel-registry/open-apparel-registry/pull/573)
- Add GitHub issue template for "draft" issues [#590](https://github.com/open-apparel-registry/open-apparel-registry/pull/590)
- Allow superusers to view all lists [#584](https://github.com/open-apparel-registry/open-apparel-registry/pull/584)
- AboutClaimedFacilities component & disclaimer text [#608](https://github.com/open-apparel-registry/open-apparel-registry/pull/608)
- Add facility delete API [#616](https://github.com/open-apparel-registry/open-apparel-registry/pull/616)
- Add UI to enable administrators to delete and merge facilities through the dashboard [#615](https://github.com/open-apparel-registry/open-apparel-registry/pull/615)
- Enable contributors to remove individual facility list items from public display [#619](https://github.com/open-apparel-registry/open-apparel-registry/pull/619)

### Changed

- Adjust /claimed routing container [#574](https://github.com/open-apparel-registry/open-apparel-registry/pull/574)
- Ensure at most one claim can be approved per facility [#585](https://github.com/open-apparel-registry/open-apparel-registry/pull/585)
- Order facility claim notes from oldest to newest on dashboard [#596](https://github.com/open-apparel-registry/open-apparel-registry/pull/596)
- Prevent users from submitting another claim for a facility when they have a first claim still pending [#601](https://github.com/open-apparel-registry/open-apparel-registry/pull/601)
- Email contributors when facility claims are approved or claim profiles are updated [#611](https://github.com/open-apparel-registry/open-apparel-registry/pull/611)
- Add `parent_company` field to facility claims [#626](https://github.com/open-apparel-registry/open-apparel-registry/pull/626)

### Fixed

- Miscellaneous bugfixes [#622](https://github.com/open-apparel-registry/open-apparel-registry/pull/622)

## [2.5.0] - 2019-06-05

### Added

- Add django-waffle and configure Django & React apps to enable feature flags [#531](https://github.com/open-apparel-registry/open-apparel-registry/pull/531)
- Support uploading Excel files [#532](https://github.com/open-apparel-registry/open-apparel-registry/pull/532)
- Fetch client country code based on IP [#541](https://github.com/open-apparel-registry/open-apparel-registry/pull/541)
- Free text search filter for facility list items [#542](https://github.com/open-apparel-registry/open-apparel-registry/pull/542)
- Add admin-authorized dashboard route: [#553](https://github.com/open-apparel-registry/open-apparel-registry/pull/553)
- Enabled hot reloading during development in React app [#556](https://github.com/open-apparel-registry/open-apparel-registry/pull/556)
- Create `/dashboard/lists` and `/dashboard/claims` routes [#557](https://github.com/open-apparel-registry/open-apparel-registry/pull/557)

### Changed

- Show active facility list names and descriptions on profile page [#534](https://github.com/open-apparel-registry/open-apparel-registry/pull/534)
- Conditionally make requests to Google services based on client country
  detected by IP geolocation [#548](https://github.com/open-apparel-registry/open-apparel-registry/pull/548)

### Deprecated

### Removed

### Fixed

- Fixed script name in release issue template [#529](https://github.com/open-apparel-registry/open-apparel-registry/pull/529)

### Security

- Bumped Django REST framework to version not impacted by [WS-2019-0037](https://github.com/encode/django-rest-framework/commit/75a489150ae24c2f3c794104a8e98fa43e2c9ce9) [#536](https://github.com/open-apparel-registry/open-apparel-registry/pull/536)
- Upgrade axios to 0.19.0 [#554](https://github.com/open-apparel-registry/open-apparel-registry/pull/554)

## [2.4.0] - 2019-05-20

### Added

- Add django-simple-history and create audit model for facilities [#521](https://github.com/open-apparel-registry/open-apparel-registry/pull/521)
- Facility list items can be filtered by status [#507](https://github.com/open-apparel-registry/open-apparel-registry/pull/507)
- Facility lists pages displays a count of item statuses [#511](https://github.com/open-apparel-registry/open-apparel-registry/pull/511)
- Retry failed batch jobs up to 3 times and report job failures to Rollbar [#512](https://github.com/open-apparel-registry/open-apparel-registry/pull/512/)

### Changed

- Set maximum page size for Facilities list API endpoint to 500 facilities per request. [#509](https://github.com/open-apparel-registry/open-apparel-registry/pull/509)
- Upgraded React to 16.8.6 [#511](https://github.com/open-apparel-registry/open-apparel-registry/pull/511)
- Changed the name of country code MK to North Macedonia [#525](https://github.com/open-apparel-registry/open-apparel-registry/pull/525)

### Fixed

- Made some fields read only in the Django admin to prevent slow page loads resulting in service interruptions. [#527](https://github.com/open-apparel-registry/open-apparel-registry/pull/527)

## [2.3.0] - 2019-05-08

### Changed

- Change facility list CSV download to request one page at a time [#496](https://github.com/open-apparel-registry/open-apparel-registry/pull/496)
- Handle CSV files that include a byte order mark [#498](https://github.com/open-apparel-registry/open-apparel-registry/pull/498)

## [2.2.0] - 2019-04-11

### Added

- Password can be changed from the profile page [#469](https://github.com/open-apparel-registry/open-apparel-registry/pull/469)

### Changed

- Update release checklist to keep default commit messages [#451](https://github.com/open-apparel-registry/open-apparel-registry/pull/451)
- Add support for encrypted RDS for PostgreSQL storage [#461](https://github.com/open-apparel-registry/open-apparel-registry/pull/461)
- Update the text on the home page "Guide" tab [#468](https://github.com/open-apparel-registry/open-apparel-registry/pull/468)

### Fixed

- Add a new error boundary to enable the FacilitiesMap component to crash without crashing the rest of the app [#446](https://github.com/open-apparel-registry/open-apparel-registry/pull/446)
- Revise geocoding unit test to be more robust [#466](https://github.com/open-apparel-registry/open-apparel-registry/pull/466)
- Remove duplicate values from the contributors API [#453](https://github.com/open-apparel-registry/open-apparel-registry/pull/453)

## [2.1.0] - 2019-04-01

### Added

- Add `reprocess_geocode_failures` management command [#439](https://github.com/open-apparel-registry/open-apparel-registry/pull/439)

### Changed

- Add protocol to contributor website if mising [#445](https://github.com/open-apparel-registry/open-apparel-registry/pull/445)
- Rename "Account Name" and "Account Description" registration form fields to "Contributor Name" and "Account Description" [#444](https://github.com/open-apparel-registry/open-apparel-registry/pull/444)
- Filter contributors with no active and public lists from contributors search dropdown [#430](https://github.com/open-apparel-registry/open-apparel-registry/pull/430)
- Remove `"(beta)"` from page title [#418](https://github.com/open-apparel-registry/open-apparel-registry/pull/418)

### Fixed

- Set ERROR_MATCHING status to non-geocoded list items for which all potential matches have been rejected [#437](https://github.com/open-apparel-registry/open-apparel-registry/pull/437)
- Return 400/Bad Request error for /api/facilities request with invalid contributor parameter type. [#433](https://github.com/open-apparel-registry/open-apparel-registry/pull/433)
- Avoid unhandled exception when matching a list with no geocoded items [#439](https://github.com/open-apparel-registry/open-apparel-registry/pull/439)

## [2.0.0] - 2019-03-27

### Added

- Google Analytics which activates only upon user's explicit consent [#409](https://github.com/open-apparel-registry/open-apparel-registry/pull/409)

## [0.2.0] - 2019-03-27

### Added

- Summary status for facility lists [#378](https://github.com/open-apparel-registry/open-apparel-registry/pull/378)
- Environment variables for Google Analytics [#395](https://github.com/open-apparel-registry/open-apparel-registry/pull/395)

### Changed

- Do not show facilities from inactive lists when searching [#401](https://github.com/open-apparel-registry/open-apparel-registry/pull/401)
- Redirect to facility list upon successful upload [#404](https://github.com/open-apparel-registry/open-apparel-registry/pull/404)
- Better support for wide and narrow browser widths [#392](https://github.com/open-apparel-registry/open-apparel-registry/pull/392)

### Fixed

- Handle geocodes with unescaped `#` character [#402](https://github.com/open-apparel-registry/open-apparel-registry/pull/402)

## [0.1.0] - 2019-03-26

### Added

- Initial release.

[unreleased]: https://github.com/open-apparel-registry/open-apparel-registry/compare/53...HEAD
[53]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/53
[52]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/52
[51]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/51
[50]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/50
[49]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/49
[48]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/48
[47]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/47
[46]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/46
[45]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/45
[44]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/44
[43]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/43
[42]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/42
[2.41.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.41.1
[2.41.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.41.0
[2.40.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.40.0
[2.39.2]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.39.2
[2.39.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.39.1
[2.39.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.39.0
[2.38.3]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.38.3
[2.38.2]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.38.2
[2.38.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.38.1
[2.38.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.38.0
[2.37.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.37.1
[2.37.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.37.0
[2.36.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.36.0
[2.35.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.35.0
[2.34.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.34.0
[2.33.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.33.0
[2.32.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.32.0
[2.31.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.31.1
[2.31.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.31.0
[2.30.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.30.0
[2.29.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.29.0
[2.28.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.28.0
[2.27.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.27.0
[2.26.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.26.1
[2.26.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.26.0
[2.25.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.25.0
[2.24.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.24.0
[2.23.2]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.23.2
[2.23.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.23.1
[2.23.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.23.0
[2.22.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.22.0
[2.21.1]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.21.1
[2.21.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.21.0
[2.20.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.20.0
[2.19.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.19.0
[2.18.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.18.0
[2.17.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.17.0
[2.16.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.16.0
[2.15.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.15.0
[2.14.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.14.0
[2.13.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.13.0
[2.12.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.12.0
[2.11.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.11.0
[2.10.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.10.0
[2.9.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.9.0
[2.8.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.8.0
[2.7.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.7.0
[2.6.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.6.0
[2.5.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.5.0
[2.4.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.4.0
[2.3.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.3.0
[2.2.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.2.0
[2.1.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.1.0
[2.0.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.0.0
[0.2.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/0.2.0
[0.1.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/0.1.0

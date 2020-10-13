# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed
- Update `django-ecsmanage` to version 2.0.0 [1129](https://github.com/open-apparel-registry/open-apparel-registry/pull/1129)

### Deprecated

### Removed

### Fixed

### Security

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

[Unreleased]: https://github.com/open-apparel-registry/open-apparel-registry/compare/2.34.0...HEAD
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

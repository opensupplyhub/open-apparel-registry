# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add vector tile ADR [#723](https://github.com/open-apparel-registry/open-apparel-registry/pull/723)
- Add contributor and mailing list admin reports and the ability to download admin reports [#726](https://github.com/open-apparel-registry/open-apparel-registry/pull/726)

### Changed

### Deprecated

### Removed

### Fixed
- Restore django-waffle admin pages [#732](https://github.com/open-apparel-registry/open-apparel-registry/pull/732)

### Security

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

[Unreleased]: https://github.com/open-apparel-registry/open-apparel-registry/compare/2.9.0...HEAD
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

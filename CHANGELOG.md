# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added

### Changed
- Update release checklist to keep default commit messages [#451](https://github.com/open-apparel-registry/open-apparel-registry/pull/451)
- Add support for encrypted RDS for PostgreSQL storage [#461](https://github.com/open-apparel-registry/open-apparel-registry/pull/461)

### Deprecated

### Removed

### Fixed

- Add a new error boundary to enable the FacilitiesMap component to crash without crashing the rest of the app [#446](https://github.com/open-apparel-registry/open-apparel-registry/pull/446)
- Revise geocoding unit test to be more robust [#466](https://github.com/open-apparel-registry/open-apparel-registry/pull/466)
- Remove duplicate values from the contributors API [#453](https://github.com/open-apparel-registry/open-apparel-registry/pull/453)

### Security

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

[Unreleased]: https://github.com/open-apparel-registry/open-apparel-registry/compare/2.1.0...HEAD
[2.1.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.1.0
[2.0.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/2.0.0
[0.2.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/0.2.0
[0.1.0]: https://github.com/open-apparel-registry/open-apparel-registry/releases/tag/0.1.0

---
name: Release
about: When ready to cut a release
title: Release X.Y.Z
labels: release
assignees: ''

---

- [ ] Start a new release branch:
```bash
$ git flow release start X.Y.Z
```
- [ ] Rotate `CHANGELOG.md` (following [Keep a Changelog](https://keepachangelog.com/) principles)
- [ ] Ensure outstanding changes are committed:
```bash
$ git add .
$ git commit -m "X.Y.Z"
```
- [ ] Publish the release branch:
```bash
$ git flow release publish X.Y.Z
```
- [ ] Test the release branch on staging
    - Wait for CI to cycle the release branch onto staging
    - Thoroughly vet new features
    - Commit any last-minute fixes
- [ ] Start a new [release pipeline job](http://civicci01.internal.azavea.com/view/oar/job/Open%20Apparel%20Registry%20Release%20Pipeline/build?delay=0sec) with the SHA of `release/X.Y.Z` that was tested on staging
- [ ] Run migrations, if applicable (see the `showmigrations` release pipeline stage):
```bash
$ ./scripts/manage.py ecsmanage -e production migrate
```
- [ ] Finish and publish the release branch:
```bash
$ git flow release finish -p X.Y.Z 
```

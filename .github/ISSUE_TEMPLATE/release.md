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
$ git add CHANGELOG.md
$ git commit -m "X.Y.Z"
```
- [ ] Publish the release branch:
```bash
$ git flow release publish X.Y.Z
```
- [ ] Test the release branch on staging
    - Wait for CI to cycle the release branch onto staging
    - Thoroughly vet new features
    - If testing reveals bugs:
        - [ ] Open a PR targeting the `release/X.Y.Z` branch
        - [ ] Merge after review
        - [ ] Re-test after the changes are deployed to staging
- [ ] Start a new [release pipeline job](http://civicci01.internal.azavea.com/view/oar/job/Open%20Apparel%20Registry%20Release%20Pipeline/build?delay=0sec) with the SHA of `release/X.Y.Z` that was tested on staging 
    - You can find the latest commit at https://github.com/open-apparel-registry/open-apparel-registry/commits/release/X.Y.Z
- [ ] Run migrations, if applicable (see the `showmigrations` release pipeline stage):
```bash
$ ./scripts/manage.py ecsmanage -e production migrate
```
- [ ] Finish and publish the release branch:
    - When prompted, keep the default merge commit message
    - Use `X.Y.Z` as the tag message
```bash
$ git flow release finish -p X.Y.Z 
```

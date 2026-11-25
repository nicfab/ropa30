# Releasing ROPA30

Maintainer checklist for publishing a new release. Run commands from the
repository root, on `main`, with a clean working tree.

## 1. Before the release

- [ ] All changes are committed, tested in the browser and pushed to `origin`
      (Codeberg). Codeberg pushes `main` and the tags to the GitHub mirror as
      soon as they arrive (push mirror with "Sync when commits are pushed");
      `git push github main` remains a harmless fallback.
- [ ] The release is deployed and verified on https://ropa30.eu (`./deploy.sh`).
- [ ] Choose the version number following [SemVer](https://semver.org/):
      MAJOR for incompatible changes, MINOR for new compatible features,
      PATCH for fixes.
- [ ] Set the version: `APP_VERSION` in `public/js/schema.js` and
      `npm version X.Y.Z --no-git-tag-version` (package.json and
      package-lock.json).
- [ ] If a template changed substantively (legally reviewed change), update it
      in `public/data/templates.json`: bump `version`, set `modified`, and add
      a `changelog` entry with bilingual `notes`. Editorial fixes only update
      `modified`.

## 2. CHANGELOG

- [ ] Move the entries from `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD`.
- [ ] Add the link reference at the bottom:
      `[X.Y.Z]: https://codeberg.org/nicfab/ropa30/releases/tag/vX.Y.Z`
- [ ] Commit and push: `docs(changelog): release X.Y.Z`.

## 3. Annotated tag

Use annotated tags: Software Heritage lists them as releases (with their own
`swh:1:rel:` identifier). Tags v1.0.0 and v1.1.0 are lightweight.

```bash
git tag -a vX.Y.Z -m "ropa30 vX.Y.Z"
git push origin vX.Y.Z
# after a few minutes, check that the mirror has the tag:
git ls-remote https://github.com/nicfab/ropa30.git refs/tags/vX.Y.Z
```

## 4. Release notes

Extract the release section from the CHANGELOG:

```bash
python3 - <<'EOF'
from pathlib import Path
v = 'X.Y.Z'
t = Path('CHANGELOG.md').read_text(encoding='utf-8')
start = t.index(f'## [{v}]')
end = t.index('\n## [', start + 1)
body = t[start:end].split('\n', 1)[1].strip()
Path(f'/tmp/release-notes-v{v}.md').write_text(body + '\n', encoding='utf-8')
print(body)
EOF
```

On GitHub, `#N` links to GitHub issues: in the GitHub notes, replace each
`(#N)` with an explicit link to the Codeberg issue
(`[Codeberg #N](https://codeberg.org/nicfab/ropa30/issues/N)`).

## 5. Releases on Codeberg and GitHub

- [ ] **Codeberg** (canonical): Releases → New release → tag `vX.Y.Z`,
      title `vX.Y.Z`, notes from the CHANGELOG section → Publish release.
- [ ] **GitHub** (this triggers the Zenodo archive):

```bash
gh release create vX.Y.Z --repo nicfab/ropa30 --title "vX.Y.Z" \
  --notes-file /tmp/release-notes-vX.Y.Z.md --verify-tag
```

## 6. Zenodo

- [ ] https://zenodo.org/account/settings/github/ → `nicfab/ropa30`: the new
      release is **Published**.
- [ ] On the new record: title, creator and licence
      (**AGPL-3.0-or-later**) come from `CITATION.cff`. Note the version DOI.
- [ ] The concept DOI `10.5281/zenodo.21720639` resolves to the new version.

## 7. Software Heritage

- [ ] https://archive.softwareheritage.org/save/ → origin type `git`, URL
      `https://codeberg.org/nicfab/ropa30.git` (optionally also
      `https://github.com/nicfab/ropa30.git`). Wait until the request is
      **succeeded**.
- [ ] Compute the directory SWHID locally and check it against the archive:

```bash
git rev-parse 'vX.Y.Z^{tree}'   # SWHID = swh:1:dir:<this hash>
```

- [ ] Copy the contextual SWHID from the archive (**Permalinks**, with
      "Add contextual information").

## 8. Archived line in the CHANGELOG

- [ ] Once Zenodo has published the version and the Software Heritage save
      request has succeeded, run `python3 scripts/archived.py X.Y.Z` (dry run),
      then again with `--write`. The script reads the version DOI from Zenodo
      and the snapshot from Software Heritage, checks the directory and the
      release against the local tag, and writes the line below in the
      CHANGELOG and the row in the version tables of the wiki
      (`../ropa30-wiki/Citare-ROPA30.md`, `Citing-ROPA30.md`).
- [ ] The line written under the release heading has this form:

```markdown
Archived: DOI [10.5281/zenodo.NNNNNNNN](https://doi.org/10.5281/zenodo.NNNNNNNN) ·
SWHID [`swh:1:dir:<hash>`](https://archive.softwareheritage.org/<contextual SWHID>)
```

- [ ] Commit and push: `docs(changelog): DOI and SWHID for release X.Y.Z`.
- [ ] Wiki: commit, then `git push origin main` and `git push github main:master`
      (the wiki is a separate repository and is not mirrored).

## 9. Wrap-up

- [ ] Close the issues addressed by the release, with a comment referencing it.
- [ ] Update the README (Features, Roadmap) if the release changed them.

## 10. Maintenance

- The Codeberg push mirror authenticates to GitHub with the fine-grained token
  `codeberg-mirror-ropa30` (Contents: read and write, repository
  `nicfab/ropa30` only), which **expires on 31 July 2027**. Before then,
  generate a new token on GitHub and re-create the push mirror in Codeberg
  (Settings > Repository > Mirror settings) with "Sync when commits are
  pushed" enabled; the sync settings cannot be changed on an existing mirror.

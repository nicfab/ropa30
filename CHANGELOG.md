# Changelog

All notable changes to **ropa30** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-11-24

Archived: DOI [10.5281/zenodo.24509679](https://doi.org/10.5281/zenodo.24509679) ·
SWHID [`swh:1:dir:220f55e5ec3cc7488f967076789fe6a98f454d70`](https://archive.softwareheritage.org/swh:1:dir:220f55e5ec3cc7488f967076789fe6a98f454d70;origin=https://codeberg.org/nicfab/ropa30.git;visit=swh:1:snp:1f74be65d3da1875c71e2113df16df42c7588b2a;anchor=swh:1:rel:47bd52e7d5219af7afd85480960f69909520218c)

### Added
- Optional encrypted backup: the full backup can be encrypted in the browser
  with a password chosen by the user (key derived with PBKDF2-SHA-256,
  600,000 iterations and a random salt; AES-256-GCM encryption with
  authenticated parameters). Encrypted backups are recognised on restore,
  which asks for the password; plain backups and the automatic safety
  backups are unchanged.
- Unit tests for the backup encryption module
  (`tests/backup-crypto.test.mjs`).

### Changed
- The warning under the register now points to the encrypted backup as an
  alternative to the plain one.

## [1.1.0] - 2026-11-24

Archived: DOI [10.5281/zenodo.24503773](https://doi.org/10.5281/zenodo.24503773) ·
SWHID [`swh:1:dir:400126305c3d263b2d79a6f52868d6082c99dd40`](https://archive.softwareheritage.org/swh:1:dir:400126305c3d263b2d79a6f52868d6082c99dd40;origin=https://codeberg.org/nicfab/ropa30.git;visit=swh:1:snp:0afe0cd51fe9bd9af3158bc58fbaa10a8810863b;anchor=swh:1:rev:79def8bd1062f913d50df77914ea86709a2265d5)

### Added
- Template catalogue: each template now carries `version` (integer),
  `issued` and `modified` (ISO 8601 dates) and a bilingual `changelog`,
  with terms aligned to W3C DCAT 3 / Dublin Core (`dcat:version`,
  `dcterms:issued`, `dcterms:modified`, `adms:versionNotes`) (#1).
- Detail view: creation and last-modified dates, the source template with
  its version and date, and an informative notice with the changelog notes
  when a newer template version is available. Records are never changed
  automatically (#1).
- `CITATION.cff` with citation metadata for GitHub and Zenodo, declaring
  the AGPL-3.0-or-later licence (Zenodo previously recorded AGPL-3.0-only).

### Changed
- Onboarding: the controller's email address is now required, together
  with name, city and country (Art. 30(1)(a) GDPR). Required fields are
  marked with an asterisk and `aria-required`; an invalid email address
  is flagged.
- Records created from a template now store the version of that specific
  template (`sourceTemplateVersion`) instead of the catalogue version.

## [1.0.0] - 2026-07-31

Archived: DOI [10.5281/zenodo.21720640](https://doi.org/10.5281/zenodo.21720640) ·
SWHID [`swh:1:dir:14cc4764aa39167e52a3ce0abbc9017e48647a6b`](https://archive.softwareheritage.org/swh:1:dir:14cc4764aa39167e52a3ce0abbc9017e48647a6b;origin=https://codeberg.org/nicfab/ropa30.git;visit=swh:1:snp:0afe0cd51fe9bd9af3158bc58fbaa10a8810863b;anchor=swh:1:rev:4c5ea6808708e3c24c01aea1382eef992c06bbfc)

First public release.

### Added

#### Record of processing activities (GDPR Art. 30)
- Data model for records of processing activities with IndexedDB persistence.
- Read-only detail view of a processing activity, rendered from a pure
  view-model builder.
- Editing of processing activities with collapsible cards and accordion
  layout.
- Deletion of a processing activity with confirmation.
- Distinct handling of the controller's and the processor's register
  (Art. 30(1) and 30(2)), including the `titolariPerContoDelQuale` field
  required by Art. 30(2)(a).
- Onboarding view for controller and DPO settings.
- Organisational unit as a bilingual list, with filtering in the activity
  list and in exports.

#### Template catalogue
- Template instantiation factory: a template becomes a ready-to-edit
  processing activity.
- Sector classification with 15 sectors, filtering and empty-state message.
- Template families: general-purpose (12 templates) and law firms (23
  templates). The general-purpose templates cover employment, recruitment,
  B2B and B2C customers, supplier management, accounting and tax,
  video surveillance, litigation and debt recovery, website and cookies,
  and newsletter/marketing (split into three variants).
- Legal references in the English templates limited to EU sources, with
  national references removed.

#### Export and backup
- Register export to PDF, XLSX and ODS, including controller data and
  filtering by organisational unit.
- Full backup export in JSON.
- Import and restore from a JSON backup.

#### Bilingual interface
- Bilingual data model (Italian and English) with multilingual reading UI.
- UI strings and enumeration labels extracted into locale modules.
- Persistent UI language setting, separate from the register languages.
- Initial UI language detected from the browser on first access, with a
  note on the welcome screen.

#### Progressive Web App
- Installable, offline-capable PWA with persistent storage.
- Service worker with a network-first strategy for the app shell and
  assets, falling back to cache when offline.

#### Other
- HTML scaffold with a strict Content Security Policy.
- On-page SEO: Open Graph, Twitter Card, canonical URL, robots, sitemap
  and JSON-LD.
- Bilingual README (English and Italian) with repository mirror notice.
- Link to the user guide (wiki) in the footer, localised.
- AGPL-3.0-or-later license.
- Contributing guidelines.
- Security policy.

[1.2.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.2.0
[1.1.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.1.0
[1.0.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.0.0

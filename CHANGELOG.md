# Changelog

All notable changes to **ropa30** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2026-11-25

### Added
- Contextual GDPR guidance: an information button next to each editor field
  and each section of the organisation sheet opens a short plain-language
  explanation, in Italian and English, with the relevant GDPR provisions and,
  where useful, the Italian rules (Personal Data Protection Code, decisions of
  the Garante).
- Organisation sheet: representative in the Union of a controller or processor
  not established in the Union (Art. 27), with name and contact details
  (Art. 30(1)(a) and 30(2)(a)). It appears with the organisation's details in
  the printed register and in the XLSX and ODS exports.

### Changed
- Template catalogue: the sector filter lists only the sectors for which the
  catalogue contains templates.
- Organisation sheet: the DPO checkbox now reads "A DPO has been designated"
  (Art. 37).

### Fixed
- Accessibility (WCAG 2.2 AA), following an automated audit with axe-core of
  the main screens, in light and dark theme and in both languages: the
  accessible name of the source-code link now contains its visible text; the
  activity cards in the list keep their heading and summary exposed to
  assistive technologies, with the activity name as a button; the
  controller/processor register switch announces which register is selected;
  landmark and group names are translated; the section indexes of the detail
  view and of the editor have targets of at least 24 px.

## [1.4.0] - 2026-11-25

Archived: DOI [10.5281/zenodo.24526324](https://doi.org/10.5281/zenodo.24526324) ·
SWHID [`swh:1:dir:f437b989e58a74bb951fb1e8304f5aa7814a3ae0`](https://archive.softwareheritage.org/swh:1:dir:f437b989e58a74bb951fb1e8304f5aa7814a3ae0;origin=https://codeberg.org/nicfab/ropa30.git;visit=swh:1:snp:ec37ed4a401f6456f4262294133e18c1c504d6da;anchor=swh:1:rel:d279c6b2459ece77d8650d9edbffcebe008b1368)

### Added
- Controller's record: joint controllers (Art. 26) recorded for each processing
  activity, with name, contact details and reference to the arrangement
  (Art. 30(1)(a)).
- Processor's record: the controllers on whose behalf the processor acts can
  now be entered, with name and contact details and, where applicable, their
  representative and data protection officer, plus a reference to the contract
  or other legal act under Art. 28(3) (Art. 30(2)(a)). They appear in the
  detail view and in the PDF, XLSX and ODS exports.
- Automated tests for the data-model migration, the editor and detail view,
  the XLSX export and accessibility; `npm test` runs them all.

### Changed
- Data model 5, with automatic migration of existing data and of restored
  backups; data specification draft 0.2.
- The organisation-wide list of joint controllers in the settings, which could
  never be filled in, is removed: joint controllership concerns a specific
  processing activity.
- Spreadsheet library SheetJS updated to 0.20.3 (GHSA-4r6h-8v6p-xvw6,
  GHSA-5pgg-2g8v-p4x9).

### Fixed
- Accessibility (WCAG 2.1 AA): accessible names for all editor fields; contrast
  of muted text, of the missing-translation badge and of form borders in the
  light theme; keyboard focus moved into modal dialogs, kept inside them and
  returned to the button that opened them; open/closed state of the editor
  sections and status messages announced to assistive technologies.
- English label "Controllers on whose behalf the firm acts" corrected.

## [1.3.0] - 2026-11-24

Archived: DOI [10.5281/zenodo.24513054](https://doi.org/10.5281/zenodo.24513054) ·
SWHID [`swh:1:dir:3dd70c8b4ecf1afc38fa16bf3ff1657c64262853`](https://archive.softwareheritage.org/swh:1:dir:3dd70c8b4ecf1afc38fa16bf3ff1657c64262853;origin=https://codeberg.org/nicfab/ropa30.git;visit=swh:1:snp:4507b42c52b24095a4c990a234b5dc83ed4235d3;anchor=swh:1:rel:784f4bca8e57a0f7263ff59f37d1f072b865b9e3)

### Added
- Data specification, draft 0.1: JSON Schema (2020-12) files published under
  `/schema/v0/`, describing the register settings, processing activities,
  audit log entries, plain and encrypted backups and the template catalogue.
  Each field is annotated with its GDPR reference (`x-gdpr`: record,
  provision, nature of the requirement). Test suite `tests/schema.test.mjs`
  (`npm run test:schema`), which also validates backup files.
- Dark theme, applied automatically when the operating system uses dark mode
  (screen only: printouts stay light).

### Changed
- Templates: the country of extra-EU transfers is now bilingual, like the
  other template texts; English-language users previously saw the Italian
  placeholder. The `modified` date of all templates is updated (editorial
  change, no new version).
- Backups now record the actual application version in `_meta.appVersion`
  (previously `0.0.0`).

### Fixed
- Template 023 (powers of attorney, delegations and mandates): invalid
  data-source value replaced by "mixed" (template version 2).
- Templates 005 and 034: the safeguard for extra-EU transfers is now
  "to be verified" instead of standard contractual clauses, since the country
  and the provider are still to be identified (template version 2).
- Templates 001 and 008: scenario codes made identical in both languages.
- Activity log: restore and reset are now recorded with the standard values
  (`restored`, `deleted`, target `database`); existing entries are not
  rewritten.
- Build-time dependency `source-map-js` updated (GHSA-68fv-2mgg-jv7q); it is
  not shipped with the application.

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

[1.5.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.5.0
[1.4.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.4.0
[1.3.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.3.0
[1.2.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.2.0
[1.1.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.1.0
[1.0.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.0.0

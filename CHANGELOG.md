# Changelog

All notable changes to **ropa30** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-07-31

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
- Template families: municipalities (10 templates), law firms (23
  templates), and cross-sector templates covering employment, recruitment,
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

[1.0.0]: https://codeberg.org/nicfab/ropa30/releases/tag/v1.0.0

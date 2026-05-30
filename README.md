# ropa30

> The GDPR Article 30 register, simplified.

**ropa30** is a free and open-source web application that helps small businesses,
freelancers, associations, and Data Protection Officers (DPOs) maintain their
**Record of Processing Activities (ROPA)** as required by Article 30 of the EU
General Data Protection Regulation (Regulation 2016/679).

It is designed to be radically simple — usable by people with no technical
background — while remaining rigorous from a legal and security standpoint.

🇮🇹 [Leggi questa pagina in italiano](README.it.md)

> **Repository policy.** Primary development happens on **Codeberg**
> ([codeberg.org/nicfab/ropa30](https://codeberg.org/nicfab/ropa30)).
> This GitHub repository is a read-only mirror provided for discoverability.
> Please open issues and pull requests on Codeberg.

---

## Documentation

📖 **User guide (IT/EN):** [codeberg.org/nicfab/ropa30/wiki](https://codeberg.org/nicfab/ropa30/wiki)

---

## Why ropa30?

Most ROPA tools on the market are either:

- **Expensive proprietary SaaS** (OneTrust, Openli, Captain Compliance), or
- **Complex open-source server applications** that require Linux, Docker, Apache,
  MySQL, or comparable expertise to install and run, or
- **Static spreadsheet templates** that are error-prone and quickly become outdated.

**ropa30 takes a different path**: it is a _local-first Progressive Web App_.
You open it in your browser and it just works. There is no server, no database
to configure, no account to create, no cloud to trust.

---

## Core principles

- **🔒 Privacy by design, not by promise.** Your data never leaves your device.
  No telemetry, no analytics, no third-party requests, no cloud sync.
  Everything is stored locally in your browser using IndexedDB.

- **🌍 Open source — AGPL-3.0.** Free to use, study, modify, and share. Any
  derivative work — including web services built on top of ropa30 — must
  remain open source. The same spirit as Nextcloud, Mastodon, and Bitwarden.

- **🧭 Standards-aligned.** ropa30 implements the data model defined by
  [UROPA](https://github.com/uropa-project/uropa) for full interoperability
  with other GDPR tools through standardized JSON import/export.

- **🌱 Steve Jobs simplicity.** No installation, no configuration, no manuals
  required. A guided onboarding wizard walks first-time users through the
  setup. Every form field carries plain-language explanations of the relevant
  GDPR concepts.

- **🇪🇺 European, sovereign infrastructure.** Primary development happens on
  [Codeberg](https://codeberg.org/nicfab/ropa30), a non-profit Forgejo
  instance based in Berlin. A GitHub mirror exists for discoverability only.

---

## Features (roadmap)

### MVP (v1.0)

- [x] Project scaffolding
- [ ] Local data model (IndexedDB) for controllers, DPO, and processing activities
- [ ] Bilingual interface (Italian / English) from day one
- [ ] Guided onboarding wizard
- [ ] Form-based editor for each processing activity with inline GDPR tooltips
- [ ] One-click PDF export (audit-ready, suitable for supervisory authority requests)
- [ ] ODS export (editable spreadsheet)
- [ ] JSON backup / restore + UROPA-compatible export
- [ ] Offline-first (full PWA, installable as a desktop or mobile app)

### Post-MVP

- [ ] Records for processors (Article 30(2))
- [ ] Optional encrypted backup (WebCrypto, AES-256)
- [ ] WCAG 2.1 AA accessibility audit
- [ ] Dark mode
- [ ] Lightweight DPIA module (Article 35)

---

## Status

🚧 **Early development.** Currently building the MVP. Watch this repository
or follow [@nicfab@fosstodon.org](https://fosstodon.org/@nicfab) for updates.

---

## License

ropa30 is released under the **GNU Affero General Public License v3.0 or later**
(AGPL-3.0-or-later). See [LICENSE](LICENSE) for the full text.

---

## Author

**Nicola Fabiano** — Italian lawyer, founding partner of
[Studio Legale Fabiano](https://fabiano.law), certified DPO, ForHumanity
AI Act Certified Auditor, contributor to CEN-CENELEC JTC 21 (prEN 18274),
and member of the EDPB Support Pool of Experts.

- Blog: [nicfab.eu](https://nicfab.eu)
- Mastodon: [@nicfab@fosstodon.org](https://fosstodon.org/@nicfab)
- arXiv: [author page](https://arxiv.org/a/fabiano_n_2.html)

---

## Contributing

Contributions are welcome — bug reports, feature requests, translations, and
pull requests. Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) (coming soon).

For security issues, please refer to [SECURITY.md](docs/SECURITY.md) (coming soon)
and do **not** open public issues.

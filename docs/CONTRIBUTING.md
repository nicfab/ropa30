# Contributing to ropa30

Thank you for your interest in contributing to **ropa30**. This document
describes how to report issues, propose changes, and submit pull requests.

ropa30 is a privacy-first, local-only Progressive Web App. The project is
intentionally minimal in scope and dependencies. Contributions that align
with the project's core principles (privacy by design, simplicity, no
external services, no telemetry) are very welcome.

---

## Where development happens

The **primary repository** is hosted on Codeberg:
**https://codeberg.org/nicfab/ropa30**

A read-only mirror exists on GitHub for discoverability, but **all issues
and pull requests must be submitted on Codeberg**. Activity on the GitHub
mirror will not be tracked.

---

## How to report a bug

Before opening an issue:

1. Check the [existing issues](https://codeberg.org/nicfab/ropa30/issues) to
   avoid duplicates.
2. Make sure you are using the latest version of ropa30.
3. Try to reproduce the bug in a clean browser profile to rule out
   interference from extensions.

When opening an issue, include:

- A clear, descriptive title.
- The browser and version you are using (e.g. Firefox 128, Safari 17).
- Your operating system.
- Steps to reproduce the bug.
- What you expected to happen vs. what actually happened.
- A screenshot if relevant.

**Please do not include any personal data, real ROPA content, or client
information in bug reports.** Use anonymized examples.

---

## How to propose a feature

Open an issue with the label `enhancement`. Describe:

- The problem you are trying to solve.
- The use case (who benefits and how).
- Your proposed solution (if any).
- Whether the feature is in scope for the MVP or a later release.

Please remember that ropa30 deliberately avoids feature bloat. Proposals
that compromise the project's core principles (e.g. cloud sync, telemetry,
third-party integrations that send data outside the browser) will be
declined regardless of demand.

---

## How to submit a pull request

1. Fork the repository on Codeberg.
2. Create a branch from `main` with a descriptive name
   (e.g. `feat/export-pdf`, `fix/i18n-italian-typo`).
3. Make your changes. Keep commits small, focused, and well-described.
4. Ensure existing functionality is not broken.
5. Open a pull request against `main`.

Use [Conventional Commits](https://www.conventionalcommits.org/) style for
commit messages where possible:

- `feat:` — a new feature
- `fix:` — a bug fix
- `docs:` — documentation only
- `style:` — formatting, no code change
- `refactor:` — code restructuring without behavior change
- `test:` — adding or fixing tests
- `chore:` — tooling, build, scaffolding

---

## Translations

ropa30 ships with Italian and English from day one. Additional translations
are very welcome. To contribute a translation:

1. Open an issue announcing the language you intend to add.
2. Copy `public/locales/en.json` to `public/locales/<lang>.json`.
3. Translate all the values (not the keys).
4. Submit a pull request.

Please use formal register and avoid colloquialisms — ropa30 is a tool
used in professional and legal contexts.

---

## Code of Conduct

By participating in this project, you agree to abide by the
[Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/),
version 2.1.

Be respectful, be patient, assume good faith.

---

## License

By contributing to ropa30, you agree that your contributions will be
licensed under the **GNU Affero General Public License v3.0 or later**
(AGPL-3.0-or-later), the same license as the project itself.

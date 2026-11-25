# ROPA30 data specification — draft 0.2

Machine-readable description of the data handled by [ROPA30](https://ropa30.eu), the local-first application for the record of processing activities under Article 30 of the GDPR (Regulation (EU) 2016/679).

**Status: superseded.** This draft is no longer updated: use the stable version, [`v1`](../v1/README.md). Draft 0.2 and version 1.0 describe the same data (data model 5, backup format 1).

The specification describes the data as ROPA30 actually stores and exports it. Its purposes are:

- to document the format of backups and templates;
- to let other tools read and produce compatible data;
- to verify automatically that the application's data remain consistent.

## Files

All schemas follow [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/schema). They are published at `https://ropa30.eu/schema/v0/<file>`.

| File | Describes |
|---|---|
| `common.schema.json` | Shared types: bilingual text, dates, code lists |
| `settings.schema.json` | Register settings: the organisation keeping the register, its representative, the DPO, register languages |
| `processing-activity.schema.json` | One processing activity, for either the controller's or the processor's record, including joint controllers (controller's record) and the controllers on whose behalf the processor acts (processor's record) |
| `audit-entry.schema.json` | One entry of the activity log |
| `backup.schema.json` | Plain backup file |
| `backup-encrypted.schema.json` | Password-encrypted backup file (PBKDF2-SHA-256 and AES-256-GCM) |
| `template-catalog.schema.json` | Template catalogue (`public/data/templates.json`) |

## Versions

Three version numbers evolve independently:

| Version | Current value | Where it appears |
|---|---|---|
| Specification | `0.2.0-draft` | `x-spec-version` in every schema |
| Data model | `5` | `schemaVersion` in settings and processing activities |
| Backup format | `1` | `_meta.exportFormatVersion` in backups |

This draft describes data model 5 and backup format 1. Backups produced by earlier versions with an older data model are migrated by the application when restored, and are outside the scope of these schemas.

## Conventions

- **Field names** are those actually stored by ROPA30. They follow Italian GDPR terminology, for example `finalita` (purposes) and `categorieInteressati` (categories of data subjects). The schema descriptions are in English.
- **Free text** is bilingual: `{ "it": "…", "en": "…" }`. Either language may be empty, and no automatic translation is performed.
- **Codes** are language-neutral identifiers, such as `contratto` for Art. 6(1)(b). The application supplies their labels, which are never stored. Each code is documented in `common.schema.json`.
- **Empty values are valid.** A record may be incomplete while it is being drafted. `required` means that a field is always present, not that it has been filled in. Legal completeness is expressed by `x-gdpr`.
- **Strictness.** Unknown fields and unknown codes are rejected (`additionalProperties: false`).
- **Legacy values.** Values written by earlier versions are accepted where they can still occur in stored data, and are marked `deprecated`. The application never writes them and never rewrites existing data or log entries.

## Annotations

The schemas use four annotation keywords. They document the data and do not affect validation.

### `x-gdpr`

`x-gdpr` links a field to the GDPR. It is a list of entries of the form:

```json
{ "register": "controller", "provision": "Art. 30(1)(f)", "requirement": "where-possible" }
```

- `register` is `controller` (record under Art. 30(1)) or `processor` (record under Art. 30(2)). If a register has no entry, the field is not required by Art. 30 for that register.
- `requirement` is one of:

| Value | Meaning |
|---|---|
| `mandatory` | Content required by Art. 30 |
| `where-applicable` | Required "where applicable" |
| `where-possible` | Required "where possible" |
| `supplementary` | Not required by Art. 30; recorded for accountability (Art. 5(2)). `provision` names the related provision, if any. |

To print the complete mapping, run `node tests/schema.test.mjs --x-gdpr`.

The mapping is informative and does not constitute legal advice. The controller or processor remains responsible for the content and completeness of its record.

### `x-dcat`

`x-dcat` maps the versioning fields of templates to [W3C DCAT 3](https://www.w3.org/TR/vocab-dcat-3/) and Dublin Core terms:

- `dcat:version`
- `dcterms:issued`
- `dcterms:modified`
- `adms:versionNotes`

### `x-ropa30`

`x-ropa30` records information specific to the application:

- the data model version;
- fields required by the user interface (`requiredInUI`);
- fields that are reserved or not yet editable.

### `x-spec-version`

`x-spec-version` gives the version of the specification.

## Validation

From the repository root:

```sh
npm run test:schema                                 # all checks
node tests/schema.test.mjs path/to/backup.json      # also validate one or more backup files
node tests/schema.test.mjs --x-gdpr                 # print the GDPR mapping
```

The test suite checks that:

- the schemas compile;
- the code lists match the application's constants;
- the objects produced by the application are valid;
- the template catalogue is valid and internally consistent (versions, dates, scenarios);
- invalid data is rejected.

## Licence

Part of ROPA30. © Nicola Fabiano. Licensed under AGPL-3.0-or-later.

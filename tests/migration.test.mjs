/*
 * ropa30 — tests/migration.test.mjs
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tests of the data-model migrations in public/js/db.js (v4 -> v5 and the
 * idempotence of the chain), without a browser: Dexie is replaced by a stub
 * that only accepts the schema declarations, and every migrated record is
 * validated against the data specification (public/schema/v0).
 *
 *   node tests/migration.test.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import Ajv2020Module from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';

// --- Dexie stub: db.js only declares versions/stores/upgrades at import time.
const chain = new Proxy(function () {}, { get: () => chain, apply: () => chain, construct: () => chain });
globalThis.window = { Dexie: chain };

const S = await import('../public/js/schema.js');
const { migrateProcessingActivity, migrateSettings, normalizeBilingualShapes } = await import('../public/js/db.js');

const Ajv2020 = Ajv2020Module.default ?? Ajv2020Module;
const addFormats = addFormatsModule.default ?? addFormatsModule;
const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
ajv.addVocabulary(['x-spec-version', 'x-gdpr', 'x-ropa30', 'x-dcat']);
const DIR = new URL('../public/schema/v0/', import.meta.url);
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.schema.json'))) {
  ajv.addSchema(JSON.parse(readFileSync(new URL(f, DIR), 'utf8')));
}
const PA = ajv.getSchema('https://ropa30.eu/schema/v0/processing-activity.schema.json');
const SET = ajv.getSchema('https://ropa30.eu/schema/v0/settings.schema.json');

let passed = 0;
let failed = 0;
function check(label, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? '\n       ' + detail : '')); }
}
const errs = (fn) => (fn.errors || []).slice(0, 5).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
const clone = (o) => JSON.parse(JSON.stringify(o));
const B = (it, en = '') => ({ it, en });

// A v4 processing activity (as stored before this release).
function v4Record(tipoRegistro, titolari) {
  const r = S.createDefaultProcessingActivity({ id: 'pa-' + tipoRegistro });
  delete r.contitolari;
  r.schemaVersion = 4;
  r.tipoRegistro = tipoRegistro;
  r.titolariPerContoDelQuale = titolari;
  return r;
}

console.log('1. Processing activity v4 -> v5');
check('SCHEMA_VERSION is 5', S.SCHEMA_VERSION === 5);

const a = migrateProcessingActivity(v4Record('titolare', []), 'it', 'it');
check('controller record: schemaVersion 5', a.schemaVersion === 5);
check('controller record: contitolari added (empty)', Array.isArray(a.contitolari) && a.contitolari.length === 0);
check('controller record: valid against the specification', PA(a), errs(PA));

const legacy = v4Record('responsabile', [
  { denominazione: B('Cliente S.p.A.'), contatti: 'privacy@cliente.example', ruolo: 'committente' },
  { denominazione: 'Altro cliente', contatti: '', ruolo: '' },
  null
]);
const b = migrateProcessingActivity(clone(legacy), 'it', 'it');
const t0 = b.titolariPerContoDelQuale[0];
check('processor record: schemaVersion 5', b.schemaVersion === 5);
check('entry gains rappresentante, dpo, riferimentoContratto',
  t0.rappresentante === '' && t0.dpo === '' && JSON.stringify(t0.riferimentoContratto) === '{"it":"","en":""}');
check('"ruolo" dropped, its text kept in contatti', !('ruolo' in t0) && t0.contatti === 'privacy@cliente.example — committente', t0.contatti);
check('plain-string name made bilingual', JSON.stringify(b.titolariPerContoDelQuale[1].denominazione) === '{"it":"Altro cliente","en":""}');
check('null entry normalised', b.titolariPerContoDelQuale[2] && b.titolariPerContoDelQuale[2].contatti === '');
check('processor record: valid against the specification', PA(b), errs(PA));

const c = migrateProcessingActivity(clone(b), 'it', 'it');
check('idempotent on v5 records', JSON.stringify(c) === JSON.stringify(b));

const fresh = S.createDefaultProcessingActivity({ id: 'new' });
check('new record (factory) valid', PA(fresh), errs(PA));

console.log('2. Settings v4 -> v5');
const s4 = S.createDefaultSettings();
s4.schemaVersion = 4;
s4.contitolari = [];
const s5 = migrateSettings(clone(s4), 'it');
check('empty settings.contitolari removed', !('contitolari' in s5) && s5.schemaVersion === 5);
check('settings valid against the specification', SET(s5), errs(SET));
const s4b = clone(s4); s4b.contitolari = [{ nome: 'Legacy' }];
const s5b = migrateSettings(s4b, 'it');
check('non-empty legacy settings.contitolari preserved', Array.isArray(s5b.contitolari) && s5b.contitolari.length === 1);
check('default settings (factory) have no contitolari', !('contitolari' in S.createDefaultSettings()));

console.log('3. Template factory normalisation');
const merged = normalizeBilingualShapes({ nome: 'x', titolariPerContoDelQuale: [{ denominazione: 'A', ruolo: 'r' }] });
check('normalisation adds contitolari', Array.isArray(merged.contitolari) && merged.contitolari.length === 0);
check('normalisation gives v5 entries', merged.titolariPerContoDelQuale[0].contatti === 'r' && 'dpo' in merged.titolariPerContoDelQuale[0]);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

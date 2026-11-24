/*
 * ropa30 — tests/schema.test.mjs
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tests of the data specification (public/schema/v0/*.schema.json).
 *
 *   node tests/schema.test.mjs                  run all checks
 *   node tests/schema.test.mjs FILE.json ...    also validate backup files
 *                                               (plain or encrypted, auto-detected)
 *   node tests/schema.test.mjs --x-gdpr         print the x-gdpr mapping (for legal review)
 *
 * Checks:
 *   1. every schema compiles (JSON Schema 2020-12, ajv, unknown keywords rejected);
 *   2. the code lists in the schemas match the constants in public/js/schema.js;
 *   3. the objects produced by the application factories are valid;
 *   4. public/data/templates.json is valid, with consistent versions and dates;
 *   5. plain and encrypted backup envelopes are valid;
 *   6. invalid data is rejected (the schemas are strict);
 *   7. optional: real backup files given on the command line.
 */

import { readFileSync, readdirSync } from 'node:fs';
import Ajv2020Module from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';

import * as S from '../public/js/schema.js';
import { encryptEnvelope } from '../public/js/crypto/backup-crypto.js';

const Ajv2020 = Ajv2020Module.default ?? Ajv2020Module;
const addFormats = addFormatsModule.default ?? addFormatsModule;

const SCHEMA_DIR = new URL('../public/schema/v0/', import.meta.url);
const TEMPLATES = new URL('../public/data/templates.json', import.meta.url);
const BASE = 'https://ropa30.eu/schema/v0/';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
ajv.addVocabulary(['x-spec-version', 'x-gdpr', 'x-ropa30', 'x-dcat']);

const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.schema.json')).sort();
const schemas = {};
for (const f of files) {
  schemas[f] = JSON.parse(readFileSync(new URL(f, SCHEMA_DIR), 'utf8'));
  ajv.addSchema(schemas[f]);
}
const v = (name) => ajv.getSchema(BASE + name);

let passed = 0;
let failed = 0;
function check(label, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? '\n       ' + detail : '')); }
}
function errs(validate) {
  return (validate.errors || []).slice(0, 5)
    .map((e) => `${e.instancePath || '/'} ${e.message}${e.params && e.params.additionalProperty ? ' (' + e.params.additionalProperty + ')' : ''}`)
    .join('\n       ');
}
function valid(name, data, label) {
  const fn = v(name);
  const ok = fn(data);
  check(label, ok, ok ? '' : errs(fn));
  return ok;
}
function invalid(name, data, label) {
  check(label, !v(name)(data), 'accepted, but it should have been rejected');
}
const clone = (o) => JSON.parse(JSON.stringify(o));

// ---------------------------------------------------------------------------
// --x-gdpr: print the mapping and exit
// ---------------------------------------------------------------------------
if (process.argv.includes('--x-gdpr')) {
  const rows = [];
  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node['x-gdpr'])) {
      for (const e of node['x-gdpr']) rows.push([path, e.register, e.provision || '-', e.requirement]);
    }
    if (node.properties) for (const [k, sub] of Object.entries(node.properties)) walk(sub, path ? path + '.' + k : k);
  };
  const pa = schemas['processing-activity.schema.json'];
  walk(schemas['settings.schema.json'], 'settings');
  walk(pa.$defs.fields, 'processingActivity');
  const w = [0, 0, 0, 0];
  rows.forEach((r) => r.forEach((c, i) => { w[i] = Math.max(w[i], c.length); }));
  for (const r of rows) console.log(r.map((c, i) => c.padEnd(w[i])).join('  '));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 1. Compilation
// ---------------------------------------------------------------------------
console.log('1. Compilation of the schemas');
for (const f of files) {
  let ok = true; let msg = '';
  try { ajv.getSchema(BASE + f) || (ok = false); } catch (e) { ok = false; msg = e.message; }
  check(f, ok, msg);
  check(f + ': $id matches the file name', schemas[f].$id === BASE + f, schemas[f].$id);
  check(f + ': x-spec-version', schemas[f]['x-spec-version'] === '0.1.0-draft');
}

// ---------------------------------------------------------------------------
// 2. Code lists in sync with public/js/schema.js
// ---------------------------------------------------------------------------
console.log('2. Code lists in sync with public/js/schema.js');
const defs = schemas['common.schema.json'].$defs;
const codes = (d) => (d.oneOf ? d.oneOf.map((x) => x.const) : d.enum).slice().sort();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pairs = [
  ['registerType', S.TIPO_REGISTRO],
  ['legalBasisArt6', S.BASE_GIURIDICA_ART6],
  ['conditionArt9', S.CONDIZIONE_ART9],
  ['transferSafeguard', S.GARANZIA_TRASFERIMENTO],
  ['dataSource', S.FONTE_DATI],
  ['finalAction', S.AZIONE_FINALE_DATI],
  ['auditAction', S.AUDIT_AZIONE],
  ['auditTarget', S.AUDIT_TARGET]
];
for (const [name, constant] of pairs) {
  const a = codes(defs[name]); const b = Object.values(constant).sort();
  check(name, same(a, b), `schema ${JSON.stringify(a)} vs code ${JSON.stringify(b)}`);
}
check('language', same(codes(defs.language), S.LINGUE_SUPPORTATE.slice().sort()));
check('data model version', schemas['processing-activity.schema.json'].properties === undefined &&
  schemas['processing-activity.schema.json']['x-ropa30'].dataModelVersion === S.SCHEMA_VERSION &&
  schemas['settings.schema.json']['x-ropa30'].dataModelVersion === S.SCHEMA_VERSION,
  'x-ropa30.dataModelVersion differs from SCHEMA_VERSION');
check('export format version',
  schemas['backup.schema.json'].properties._meta.properties.exportFormatVersion.const === S.EXPORT_FORMAT_VERSION);

// ---------------------------------------------------------------------------
// 3. Objects produced by the application factories
// ---------------------------------------------------------------------------
console.log('3. Objects produced by the application');
const settings = S.createDefaultSettings();
const pa = S.createDefaultProcessingActivity({ id: 'pa-test-1' });
valid('settings.schema.json', settings, 'default settings');
valid('processing-activity.schema.json', pa, 'default processing activity');
for (const azione of Object.values(S.AUDIT_AZIONE)) {
  for (const targetType of Object.values(S.AUDIT_TARGET)) {
    valid('audit-entry.schema.json',
      S.createAuditEntry({ id: 'a1', azione, targetType, targetId: 'x', summary: 's' }),
      `audit entry ${azione}/${targetType}`);
  }
}

// A complete processing activity (controller's record), every list filled in.
const B = (it, en) => ({ it, en: en ?? it });
const full = clone(pa);
Object.assign(full, {
  unitaOrganizzativa: [{ unita: B('Ufficio legale', 'Legal office') }],
  codiceUtente: 'TR-01',
  sourceTemplateId: 'tpl-it-001-rapporto-lavoro', sourceTemplateVersion: 2, sourceTemplateLanguage: 'it',
  nome: B('Gestione del personale', 'Personnel management'),
  dataInizioTrattamento: '2024-01-15',
  finalita: [B('Gestione del rapporto di lavoro')],
  categorieInteressati: [B('Dipendenti')], categorieDati: [B('Dati anagrafici')],
  fonteDeiDati: 'misto', categorieDestinatari: [B('Consulente del lavoro')],
  responsabiliEsterni: [{ denominazione: B('Studio X'), sede: B('Roma'), finalita: B('Paghe'),
    accordoArt28Presente: true, riferimentoContratto: B('Contratto 2024'), notaRuoloPrivacy: B('') }],
  trasferimentiExtraUE: [{ paese: B('Stati Uniti', 'United States'), garanziaApplicata: 'scc', riferimentoDocumentazione: B('') }]
});
full.baseGiuridica.art6 = ['contratto', 'obbligo_legale'];
full.baseGiuridica.art9 = ['obblighi_lavoro'];
full.misureSicurezza.tecniche = [B('Cifratura')];
valid('processing-activity.schema.json', full, 'complete processing activity (controller)');

const proc = clone(full);
proc.tipoRegistro = 'responsabile';
proc.titolariPerContoDelQuale = [{ denominazione: B('Cliente S.p.A.'), contatti: 'privacy@cliente.example', ruolo: 'titolare' }];
valid('processing-activity.schema.json', proc, 'processing activity (processor\'s record)');

const legacy = clone(full); legacy.fonteDeiDati = 'diretta';
valid('processing-activity.schema.json', legacy, 'legacy fonteDeiDati "diretta" accepted in a stored record');

// ---------------------------------------------------------------------------
// 4. Template catalogue
// ---------------------------------------------------------------------------
console.log('4. Template catalogue (public/data/templates.json)');
const catalog = JSON.parse(readFileSync(TEMPLATES, 'utf8'));
valid('template-catalog.schema.json', catalog, `catalogue: ${catalog.templates.length} templates`);
const ids = new Set();
let dup = []; let inconsistent = [];
for (const t of catalog.templates) {
  if (ids.has(t.templateId)) dup.push(t.templateId);
  ids.add(t.templateId);
  const cl = t.changelog || [];
  const last = cl[cl.length - 1] || {}; const first = cl[0] || {};
  const increasing = cl.every((e, i) => i === 0 || e.version > cl[i - 1].version);
  const scenIt = (t.scenari?.it || []).map((s) => s.id + ':' + s.art6).join();
  const scenEn = (t.scenari?.en || []).map((s) => s.id + ':' + s.art6).join();
  const problems = [];
  if (last.version !== t.version) problems.push(`version ${t.version} != last changelog ${last.version}`);
  if (last.date !== t.modified) problems.push(`modified ${t.modified} != last changelog date ${last.date}`);
  if (first.date !== t.issued) problems.push(`issued ${t.issued} != first changelog date ${first.date}`);
  if (!increasing) problems.push('changelog versions not increasing');
  if (t.modified < t.issued) problems.push('modified before issued');
  if (scenIt !== scenEn) problems.push('scenarios differ between it and en');
  if (problems.length) inconsistent.push(t.templateId + ': ' + problems.join('; '));
}
check('templateId unique', dup.length === 0, dup.join(', '));
check('versions, dates and scenarios consistent', inconsistent.length === 0, inconsistent.join('\n       '));

const badTpl = clone(catalog); badTpl.templates[0].preset.fonteDeiDati = 'diretta';
invalid('template-catalog.schema.json', badTpl, 'legacy fonteDeiDati rejected in a template');
const badTpl2 = clone(catalog); badTpl2.templates[0].preset.metadata = {};
invalid('template-catalog.schema.json', badTpl2, 'technical field rejected in a preset');

// ---------------------------------------------------------------------------
// 5. Backup envelopes
// ---------------------------------------------------------------------------
console.log('5. Backup envelopes');
const audit = [S.createAuditEntry({ id: 'a1', azione: 'created', targetType: 'processingActivity', targetId: 'pa-test-1', summary: '' }),
  { id: 'a0', tenantId: 'default', timestamp: '2026-11-24T18:00:00.000Z', azione: 'RESTORE', targetType: 'database', targetId: 'all', summary: '' }];
const envelope = {
  _meta: { app: 'ropa30', exportFormatVersion: S.EXPORT_FORMAT_VERSION, appVersion: S.APP_VERSION,
    schemaVersion: S.SCHEMA_VERSION, exportedAt: new Date().toISOString(),
    counts: { settings: 1, processingActivities: 3, auditLog: 2 } },
  data: { settings: [settings], processingActivities: [pa, full, proc], auditLog: audit }
};
valid('backup.schema.json', envelope, 'plain backup (with a legacy audit entry)');
const enc = await encryptEnvelope(envelope, 'correct horse battery staple');
valid('backup-encrypted.schema.json', enc, 'encrypted backup produced by encryptEnvelope()');

// ---------------------------------------------------------------------------
// 6. Invalid data is rejected
// ---------------------------------------------------------------------------
console.log('6. Invalid data is rejected');
const mut = (base, fn) => { const o = clone(base); fn(o); return o; };
const PA = 'processing-activity.schema.json';
invalid(PA, mut(full, (o) => { o.campoInventato = 1; }), 'unknown field');
invalid(PA, mut(full, (o) => { o.fonteDeiDati = 'diretto'; }), 'unknown code (fonteDeiDati)');
invalid(PA, mut(full, (o) => { o.baseGiuridica.art6.push('consent'); }), 'unknown legal basis');
invalid(PA, mut(full, (o) => { o.nome = { it: 'x' }; }), 'bilingual text without "en"');
invalid(PA, mut(full, (o) => { o.finalita = ['solo testo']; }), 'plain string instead of bilingual text');
invalid(PA, mut(full, (o) => { o.trasferimentiExtraUE[0].paese = 'USA'; }), 'paese as plain string');
invalid(PA, mut(full, (o) => { o.dataInizioTrattamento = '15/01/2024'; }), 'date not in ISO 8601');
invalid(PA, mut(full, (o) => { delete o.finalita; }), 'missing field');
invalid(PA, mut(full, (o) => { o.schemaVersion = 3; }), 'other data model version');
invalid('settings.schema.json', mut(settings, (o) => { o.registro = { lingue: ['it'], linguaPrincipale: 'en' }; }),
  'primary language not among the enabled languages');
invalid('settings.schema.json', mut(settings, (o) => { o.titolare.email = 'non-una-email'; }), 'invalid e-mail address');
invalid('audit-entry.schema.json', { ...audit[0], azione: 'cancellato' }, 'unknown audit action');
invalid('backup.schema.json', mut(envelope, (o) => { o._meta.app = 'altro'; }), 'backup of another application');
invalid('backup-encrypted.schema.json', mut(enc, (o) => { o.kdf.iterations = 1000; }), 'too few PBKDF2 iterations');
invalid('backup-encrypted.schema.json', mut(enc, (o) => { o.cipher.name = 'AES-CBC'; }), 'other cipher');

// ---------------------------------------------------------------------------
// 7. Backup files given on the command line
// ---------------------------------------------------------------------------
const extra = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (extra.length) console.log('7. Backup files');
for (const file of extra) {
  let obj;
  try { obj = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { check(file, false, e.message); continue; }
  if (obj && obj.format === 'ropa30-backup-encrypted') {
    valid('backup-encrypted.schema.json', obj, `${file} (encrypted)`);
    continue;
  }
  valid('backup.schema.json', obj, `${file} (plain)`);
  const c = obj?._meta?.counts || {}; const d = obj?.data || {};
  const mism = ['settings', 'processingActivities', 'auditLog']
    .filter((k) => !Array.isArray(d[k]) || c[k] !== d[k].length);
  check(`${file}: counts match the data`, mism.length === 0, mism.join(', '));
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

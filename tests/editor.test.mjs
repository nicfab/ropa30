/*
 * ropa30 — tests/editor.test.mjs
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tests of the editor and detail view-models for the parties under
 * Art. 30(1)(a) (joint controllers) and Art. 30(2)(a) (controllers on whose
 * behalf the processor acts): visibility by type of record, adding rows,
 * writing back to the record (validated against the data specification) and
 * the detail view used by the PDF/XLSX/ODS exports.
 *
 *   node tests/editor.test.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import Ajv2020Module from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';

import localeIt from '../public/locales/it.js';
import localeEn from '../public/locales/en.js';
import { createDefaultProcessingActivity } from '../public/js/schema.js';
import { buildEditModel, applyEditModel, nuovaRigaGruppo, aggiornaVisibilita } from '../public/js/editor.js';
import { buildDettaglio } from '../public/js/detail.js';

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

let passed = 0;
let failed = 0;
function check(label, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? '\n       ' + detail : '')); }
}
const errs = (fn) => (fn.errors || []).slice(0, 5).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
const clone = (o) => JSON.parse(JSON.stringify(o));
const campo = (model, chiave) => model.sezioni[0].campi.find((c) => c.chiave === chiave);

for (const [lang, loc] of [['it', localeIt], ['en', localeEn]]) {
  const deps = { lingue: ['it', 'en'], detail: loc.detail, enums: loc.enums };
  const C = loc.detail.campi;
  console.log(`Labels (${lang})`);
  for (const k of ['contitolari', 'ctDenominazione', 'ctContatti', 'ctRiferimentoAccordo', 'titolariPerContoDelQuale',
    'tcDenominazione', 'tcContatti', 'tcRappresentante', 'tcDpo', 'tcRiferimentoContratto']) {
    check(`label ${k}`, typeof C[k] === 'string' && C[k].length > 0);
  }
  check('label tcRuolo removed', !('tcRuolo' in C));
}

const loc = localeIt;
const deps = { lingue: ['it', 'en'], detail: loc.detail, enums: loc.enums };

console.log('1. Visibility by type of record');
const rec = createDefaultProcessingActivity({ id: 'pa-1' });
rec.nome = { it: 'Trattamento', en: 'Processing' };
const m = buildEditModel(clone(rec), deps);
check('controller record: joint controllers visible', campo(m, 'contitolari').visibile === true);
check('controller record: controllers-on-behalf hidden', campo(m, 'titolariPerContoDelQuale').visibile === false);
check('other fields always visible', campo(m, 'nome').visibile === true);
campo(m, 'tipoRegistro').val = 'responsabile';
aggiornaVisibilita(m);
check('switch to processor: joint controllers hidden', campo(m, 'contitolari').visibile === false);
check('switch to processor: controllers-on-behalf visible', campo(m, 'titolariPerContoDelQuale').visibile === true);

console.log('2. Rows and write-back (processor record)');
const gT = campo(m, 'titolariPerContoDelQuale');
gT.righe.push(nuovaRigaGruppo('titolariPerContoDelQuale', { detail: loc.detail, enums: loc.enums }));
const riga = gT.righe[0];
check('row has 5 controls', riga.campi.length === 5, riga.campi.map((c) => c.chiave).join(','));
const set = (r, k, v) => { const c = r.campi.find((x) => x.chiave === k); if (c.isTestoBil) { c.valIt = v; } else { c.val = v; } };
set(riga, 'denominazione', 'Cliente S.p.A.');
set(riga, 'contatti', 'privacy@cliente.example');
set(riga, 'dpo', 'dpo@cliente.example');
set(riga, 'riferimentoContratto', 'Atto di nomina 2025');
const out = applyEditModel(clone(rec), m);
const t0 = out.titolariPerContoDelQuale[0];
check('record type saved', out.tipoRegistro === 'responsabile');
check('entry written', t0.denominazione.it === 'Cliente S.p.A.' && t0.contatti === 'privacy@cliente.example'
  && t0.rappresentante === '' && t0.dpo === 'dpo@cliente.example' && t0.riferimentoContratto.it === 'Atto di nomina 2025', JSON.stringify(t0));
check('record valid against the specification', PA(out), errs(PA));

console.log('3. Rows and write-back (controller record)');
const m2 = buildEditModel(clone(rec), deps);
const gC = campo(m2, 'contitolari');
gC.righe.push(nuovaRigaGruppo('contitolari', { detail: loc.detail, enums: loc.enums }));
check('row has 3 controls', gC.righe[0].campi.length === 3);
set(gC.righe[0], 'denominazione', 'Ente partner');
set(gC.righe[0], 'contatti', 'privacy@partner.example');
const out2 = applyEditModel(clone(rec), m2);
check('joint controller written', out2.contitolari.length === 1 && out2.contitolari[0].contatti === 'privacy@partner.example'
  && out2.contitolari[0].riferimentoAccordo.it === '');
check('record valid against the specification', PA(out2), errs(PA));

console.log('4. Detail view (used by PDF/XLSX/ODS exports)');
const labels = (r) => buildDettaglio(r, 'it', { detail: loc.detail, enums: loc.enums }).sezioni[0].campi.map((c) => c.label);
check('processor record shows controllers-on-behalf only',
  labels(out).includes(loc.detail.campi.titolariPerContoDelQuale) && !labels(out).includes(loc.detail.campi.contitolari));
check('controller record shows joint controllers only',
  labels(out2).includes(loc.detail.campi.contitolari) && !labels(out2).includes(loc.detail.campi.titolariPerContoDelQuale));
const g = buildDettaglio(out, 'it', { detail: loc.detail, enums: loc.enums }).sezioni[0].campi
  .find((c) => c.label === loc.detail.campi.titolariPerContoDelQuale);
const sub = g.gruppi[0].campi.map((c) => c.label + '=' + c.value);
check('detail lists the 5 sub-fields', g.gruppi[0].campi.length === 5, sub.join(' | '));
check('DPO value shown', sub.includes(loc.detail.campi.tcDpo + '=dpo@cliente.example'));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

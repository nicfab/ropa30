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
import { buildEditModel, applyEditModel, nuovaRigaGruppo, aggiornaVisibilita, trovaPerIdGuida } from '../public/js/editor.js';
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

console.log('5. Contextual GDPR guidance');
for (const [lang, L] of [['it', localeIt], ['en', localeEn]]) {
  const G = L.guida || {};
  const dg = { lingue: ['it', 'en'], detail: L.detail, enums: L.enums, guida: G };
  const mg = buildEditModel(clone(rec), dg);
  const chiavi = new Set();
  for (const sez of mg.sezioni) {
    for (const c of sez.campi) {
      chiavi.add(c.chiave);
      (c.figli || []).forEach((f) => chiavi.add(f.chiave));
      if (c.isGruppi) nuovaRigaGruppo(c.gruppoTipo, dg).campi.forEach((sc) => chiavi.add(c.gruppoTipo + '.' + sc.chiave));
    }
  }
  const orfane = Object.keys(G).filter((k) => k !== '_pulsante' && !chiavi.has(k));
  check(`guidance keys match editor fields (${lang})`, orfane.length === 0, orfane.join(', '));
  check(`guidance button label present (${lang})`, typeof G._pulsante === 'string' && G._pulsante.length > 0);
  const conTesto = mg.sezioni.flatMap((s) => s.campi).filter((c) => c.haGuida);
  check(`fields with guidance (${lang}): ${conTesto.length}`, conTesto.length > 0);
  check(`guidance controls carry id and accessible name (${lang})`,
    conTesto.every((c) => c.idGuida && c.ariaGuida.startsWith(G._pulsante + ': ' ) && c.guida.length > 20));
}
const chiaviIt = Object.keys(localeIt.guida || {}).sort();
const chiaviEn = Object.keys(localeEn.guida || {}).sort();
check('same guidance keys in Italian and English', JSON.stringify(chiaviIt) === JSON.stringify(chiaviEn),
  chiaviIt.filter((k) => !chiaviEn.includes(k)).concat(chiaviEn.filter((k) => !chiaviIt.includes(k))).join(', '));
const dgi = { lingue: ['it', 'en'], detail: localeIt.detail, enums: localeIt.enums, guida: localeIt.guida };
const m5 = buildEditModel(clone(rec), dgi);
const fin = m5.sezioni.flatMap((s) => s.campi).find((c) => c.chiave === 'finalita');
check('toggle by id opens and closes the guidance', (() => {
  const c = trovaPerIdGuida(m5, fin.idGuida); if (!c || c.guidaAperta) return false;
  c.guidaAperta = !c.guidaAperta; const open = fin.guidaAperta === true;
  c.guidaAperta = !c.guidaAperta; return open && fin.guidaAperta === false;
})());
const gc = m5.sezioni[0].campi.find((c) => c.chiave === 'contitolari');
const rigaNuova = nuovaRigaGruppo('contitolari', dgi);
const acc = rigaNuova.campi.find((x) => x.chiave === 'riferimentoAccordo');
check('new group rows get their guidance', acc.haGuida && trovaPerIdGuida({ sezioni: [{ campi: [{ ...gc, righe: [rigaNuova] }] }] }, acc.idGuida) === acc);
const ids = new Set();
let dup = 0;
for (const s of m5.sezioni) for (const c of s.campi) { if (ids.has(c.idGuida)) dup++; ids.add(c.idGuida); }
check('guidance ids are unique', dup === 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

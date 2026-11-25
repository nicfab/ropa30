/*
 * ropa30 — tests/xlsx-export.test.mjs
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * End-to-end test of the XLSX export with the SheetJS build actually shipped
 * to users (public/js/lib/xlsx.full.min.js), without a browser:
 *   1. loads the vendored library as the browser does (global XLSX);
 *   2. builds the register model from real locales and a complete record;
 *   3. runs esportaRegistroXlsx() with a minimal DOM stub that captures the
 *      generated file;
 *   4. reads the file back and checks sheets, header rows and cell contents.
 *
 *   node tests/xlsx-export.test.mjs
 */

import { readFileSync } from 'node:fs';
import vm from 'node:vm';

import localeIt from '../public/locales/it.js';
import localeEn from '../public/locales/en.js';
import { createDefaultProcessingActivity } from '../public/js/schema.js';
import { buildModelloRegistro } from '../public/js/exporters/registro-common.js';
import { esportaRegistroXlsx } from '../public/js/exporters/xlsx.js';

let passed = 0;
let failed = 0;
function check(label, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? '\n       ' + detail : '')); }
}

// ---------------------------------------------------------------------------
// 1. Load the vendored SheetJS build as a classic script (global XLSX)
// ---------------------------------------------------------------------------
const LIB = new URL('../public/js/lib/xlsx.full.min.js', import.meta.url);
const sandbox = { console };
sandbox.self = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync(LIB, 'utf8'), sandbox, { filename: 'xlsx.full.min.js' });
const XLSX = sandbox.XLSX;
console.log('1. Library');
check('global XLSX defined', !!XLSX);
check(`version ${XLSX && XLSX.version}`, !!(XLSX && XLSX.version));

// ---------------------------------------------------------------------------
// 2. Minimal browser stub: capture the Blob passed to URL.createObjectURL
// ---------------------------------------------------------------------------
let captured = null;
let clicked = null;
globalThis.window = { XLSX };
globalThis.document = {
  createElement: () => ({ click() { clicked = this.download; } }),
  body: { appendChild() {}, removeChild() {} }
};
const realCreate = URL.createObjectURL;
URL.createObjectURL = (blob) => { captured = blob; return 'blob:test'; };
URL.revokeObjectURL = () => {};

// ---------------------------------------------------------------------------
// 3. A complete record and the register model
// ---------------------------------------------------------------------------
const B = (it, en) => ({ it, en: en ?? it });
const rec = createDefaultProcessingActivity({ id: 'pa-1' });
Object.assign(rec, {
  nome: B('Gestione del personale', 'Personnel management'),
  finalita: [B('Gestione del rapporto di lavoro', 'Employment management'), B('Adempimenti fiscali', 'Tax obligations')],
  categorieInteressati: [B('Dipendenti', 'Employees')],
  categorieDati: [B('Dati anagrafici', 'Personal details')],
  responsabiliEsterni: [{ denominazione: B('Studio Paghe S.r.l.'), sede: B('Roma', 'Rome'), finalita: B('Elaborazione paghe', 'Payroll'),
    accordoArt28Presente: true, riferimentoContratto: B('Contratto 2024', 'Contract 2024'), notaRuoloPrivacy: B('') }],
  trasferimentiExtraUE: [{ paese: B('Stati Uniti', 'United States'), garanziaApplicata: 'scc', riferimentoDocumentazione: B('Clausole 2021/914', 'Clauses 2021/914') }]
});
rec.baseGiuridica.art6 = ['contratto', 'obbligo_legale'];

for (const [lang, loc] of [['it', localeIt], ['en', localeEn]]) {
  console.log(`2. Export (${lang})`);
  captured = null; clicked = null;
  const deps = { detail: loc.detail, enums: loc.enums };
  const titolare = { denominazione: 'Organizzazione di prova', righe: [{ label: 'Denominazione', value: 'Organizzazione di prova' }], estratto: { estratto: false, unita: '' } };
  const model = buildModelloRegistro([rec], lang, deps, titolare);
  const labels = { titolo: 'Registro', generatoIl: 'Generato il', titolareTitolo: 'Dati del titolare', sheetRegistro: 'Registro titolare', fileSlug: 'registro-titolare' };

  let filename = '';
  try { filename = esportaRegistroXlsx(model, labels, new Date('2026-11-25T08:00:00')); }
  catch (e) { check('esportaRegistroXlsx() runs', false, e.message); continue; }
  check('esportaRegistroXlsx() runs', true);
  check(`file name ${filename}`, filename === 'ropa30-registro-titolare-20261125-080000.xlsx' && clicked === filename);
  check('blob type xlsx', captured && captured.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  // -------------------------------------------------------------------------
  // 4. Read the file back
  // -------------------------------------------------------------------------
  const buf = new Uint8Array(await captured.arrayBuffer());
  check('ZIP signature (PK)', buf[0] === 0x50 && buf[1] === 0x4b);
  const wb = XLSX.read(buf, { type: 'array' });
  check('sheets: Titolare, Registro titolare', JSON.stringify(wb.SheetNames) === JSON.stringify(['Titolare', 'Registro titolare']), JSON.stringify(wb.SheetNames));
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Registro titolare'], { header: 1, defval: '' });
  const header = rows[3] || [];
  const data = rows[4] || [];
  check('header row = model headers', JSON.stringify(header) === JSON.stringify(model.headers),
    `${header.length} vs ${model.headers.length} columns`);
  check('data row = model row', JSON.stringify(data) === JSON.stringify(model.rows[0]));
  const nomeIdx = model.headers.indexOf(loc.detail.campi.nome);
  check('activity name in its column', data[nomeIdx] === rec.nome[lang]);
  const cellaFinalita = data[model.headers.indexOf(loc.detail.campi.finalita)] || '';
  check('list field joined with "; "', cellaFinalita === rec.finalita.map((f) => f[lang]).join('; '), cellaFinalita);
  const cellaTr = data[model.headers.indexOf(loc.detail.campi.trasferimentiExtraUE)] || '';
  check('group field (transfers) contains country and safeguard',
    cellaTr.includes(rec.trasferimentiExtraUE[0].paese[lang]) && cellaTr.includes(loc.enums.garanziaTrasferimento.scc), cellaTr);
  const tRows = XLSX.utils.sheet_to_json(wb.Sheets.Titolare, { header: 1, defval: '' });
  check('controller sheet content', tRows.some((r) => r[0] === 'Denominazione' && r[1] === 'Organizzazione di prova'));
}

URL.createObjectURL = realCreate;
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

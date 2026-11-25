/*
 * ropa30 — tests/obbligo.test.mjs
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tests of the indicative assessment of the obligation to record a processing
 * activity under Art. 30(5) (public/js/obbligo.js), in the text in force and
 * as amended by the Omnibus IV Regulation; consistency of code lists, labels
 * and data specification.
 *
 *   node tests/obbligo.test.mjs
 */

import { readFileSync } from 'node:fs';
import localeIt from '../public/locales/it.js';
import localeEn from '../public/locales/en.js';
import * as S from '../public/js/schema.js';
import { valutaObbligo, regimeInVigore, registrazioneDovuta, descriviEsito, MOTIVI, ESITO } from '../public/js/obbligo.js';
import { buildEditModel, applyEditModel } from '../public/js/editor.js';
import { buildDettaglio } from '../public/js/detail.js';

let passed = 0;
let failed = 0;
function check(label, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? '\n       ' + detail : '')); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const att = (ob, extra = {}) => ({ ...S.createDefaultProcessingActivity({ id: 'x' }), ...extra, obbligoRegistrazione: { ...S.createDefaultProcessingActivity({ id: 'x' }).obbligoRegistrazione, ...ob } });
const org = (personeImpiegate, natura) => ({ obbligoRegistro: { personeImpiegate, natura } });

// ---------------------------------------------------------------------------
console.log('1. Version of Art. 30(5) applied');
check('text in force while the date of entry into force is not set', regimeInVigore(new Date('2030-01-01'), { inVigoreDal: null }) === 'vigente');
check('text in force before the date', regimeInVigore(new Date('2027-01-31'), { inVigoreDal: '2027-02-01' }) === 'vigente');
check('Omnibus IV text from the date', regimeInVigore(new Date('2027-02-01T08:00:00Z'), { inVigoreDal: '2027-02-01' }) === 'omnibus4');
check('application constant not yet set (no publication in the Official Journal)', S.OMNIBUS_IV.inVigoreDal === null);

// ---------------------------------------------------------------------------
console.log('2. Text in force (fewer than 250 persons)');
const V = 'vigente';
let r = valutaObbligo(att({}), org('da250a999', 'privata'), V);
check('250 or more: always mandatory', r.esito === 'obbligatorio' && eq(r.motivi, ['org_250']));
check('1000 or more: always mandatory', valutaObbligo(att({}), org('almeno1000', ''), V).esito === 'obbligatorio');
r = valutaObbligo(att({ rischio: 'no', nonOccasionale: 'no' }), org('meno250', 'privata'), V);
check('fewer than 250, no criterion met: voluntary', r.esito === 'volontario' && r.motivi.length === 0);
r = valutaObbligo(att({ rischio: 'si', nonOccasionale: 'no' }), org('meno250', ''), V);
check('risk: mandatory', r.esito === 'obbligatorio' && eq(r.motivi, ['rischio']));
r = valutaObbligo(att({ rischio: 'no', nonOccasionale: 'si' }), org('meno250', ''), V);
check('not occasional: mandatory', r.esito === 'obbligatorio' && eq(r.motivi, ['non_occasionale']));
const conArt9 = att({ rischio: 'no', nonOccasionale: 'no' }, { baseGiuridica: { ...S.createDefaultProcessingActivity({ id: 'x' }).baseGiuridica, art9: ['obblighi_lavoro'] } });
check('special categories (Art. 9) taken from section 3: mandatory', eq(valutaObbligo(conArt9, org('meno250', ''), V).motivi, ['art9']));
const conArt10 = att({ rischio: 'no', nonOccasionale: 'no' }, { datiCondannePenaliReati: { presenti: true, normativaAutorizzativa: S.bilingue() } });
check('criminal data (Art. 10) taken from section 4: mandatory', eq(valutaObbligo(conArt10, org('meno250', ''), V).motivi, ['art10']));
r = valutaObbligo(att({ rischio: 'da_valutare', nonOccasionale: 'no' }), org('meno250', ''), V);
check('not assessed: mandatory as a precaution', r.esito === 'prudenziale' && eq(r.motivi, ['da_valutare']));
r = valutaObbligo(att({ rischio: 'no', nonOccasionale: 'no' }), org('', ''), V);
check('persons employed not stated: mandatory as a precaution', r.esito === 'prudenziale' && eq(r.motivi, ['persone_non_indicate']));
check('public authority not excluded by the text in force', valutaObbligo(att({ rischio: 'no', nonOccasionale: 'no' }), org('meno250', 'pubblica'), V).esito === 'volontario');
check('Omnibus IV answers ignored under the text in force',
  valutaObbligo(att({ rischio: 'no', nonOccasionale: 'no', rischioElevato: 'si', attivitaPrincipaleDpo: 'si' }), org('meno250', 'privata'), V).esito === 'volontario');
check('record without the assessment block: mandatory as a precaution',
  valutaObbligo({ ...S.createDefaultProcessingActivity({ id: 'y' }), obbligoRegistrazione: undefined }, org('meno250', 'privata'), V).esito === 'prudenziale');

// ---------------------------------------------------------------------------
console.log('3. Omnibus IV text (fewer than 1000 persons)');
const O = 'omnibus4';
check('public authority or body: always mandatory', eq(valutaObbligo(att({ rischioElevato: 'no', attivitaPrincipaleDpo: 'no' }), org('meno250', 'pubblica'), O).motivi, ['pubblica']));
check('1000 or more: always mandatory', eq(valutaObbligo(att({}), org('almeno1000', 'privata'), O).motivi, ['org_1000']));
r = valutaObbligo(att({ rischioElevato: 'no', attivitaPrincipaleDpo: 'no' }), org('da250a999', 'privata'), O);
check('250 to 999, no criterion met: voluntary', r.esito === 'volontario');
check('high risk (Art. 35): mandatory', eq(valutaObbligo(att({ rischioElevato: 'si', attivitaPrincipaleDpo: 'no' }), org('meno250', 'privata'), O).motivi, ['rischio_elevato']));
check('case of Art. 35(3): mandatory even if the risk is answered no',
  eq(valutaObbligo(att({ rischioElevato: 'no', casiArt35par3: ['b'], attivitaPrincipaleDpo: 'no' }), org('meno250', 'privata'), O).motivi, ['art35_3']));
check('core activity requiring a DPO: mandatory', eq(valutaObbligo(att({ rischioElevato: 'no', attivitaPrincipaleDpo: 'si' }), org('meno250', 'privata'), O).motivi, ['dpo_37']));
check('reasons listed in order', eq(valutaObbligo(att({ rischioElevato: 'si', casiArt35par3: ['a'], attivitaPrincipaleDpo: 'si' }), org('meno250', 'privata'), O).motivi, ['rischio_elevato', 'art35_3', 'dpo_37']));
check('special categories alone do not make recording mandatory',
  valutaObbligo({ ...conArt9, obbligoRegistrazione: { ...conArt9.obbligoRegistrazione, rischioElevato: 'no', attivitaPrincipaleDpo: 'no' } }, org('meno250', 'privata'), O).esito === 'volontario');
r = valutaObbligo(att({ rischioElevato: 'no', attivitaPrincipaleDpo: 'da_valutare' }), org('meno250', 'privata'), O);
check('not assessed: mandatory as a precaution', r.esito === 'prudenziale' && eq(r.motivi, ['da_valutare']));
r = valutaObbligo(att({ rischioElevato: 'no', attivitaPrincipaleDpo: 'no' }), org('meno250', ''), O);
check('nature not stated: mandatory as a precaution', r.esito === 'prudenziale' && eq(r.motivi, ['natura_non_indicata']));
r = valutaObbligo(att({ rischioElevato: 'no', attivitaPrincipaleDpo: 'no' }), org('', 'privata'), O);
check('persons employed not stated: mandatory as a precaution', eq(r.motivi, ['persone_non_indicate']));
check('obligatory and prudential results require recording, voluntary does not',
  registrazioneDovuta(ESITO.OBBLIGATORIO) && registrazioneDovuta(ESITO.PRUDENZIALE) && !registrazioneDovuta(ESITO.VOLONTARIO));

// ---------------------------------------------------------------------------
console.log('4. Labels and code lists');
for (const [lang, loc] of [['it', localeIt], ['en', localeEn]]) {
  const L = loc.obbligo;
  check(`label for every result (${lang})`, Object.values(ESITO).every((e) => (L.esiti[e] || '').length > 5));
  check(`label for every reason (${lang})`, MOTIVI.every((m) => (L.motivi[m] || '').length > 5), MOTIVI.filter((m) => !L.motivi[m]).join(', '));
  check(`editor notes for both versions of Art. 30(5) (${lang})`, L.note.vigente.length > 50 && L.note.omnibus4.length > 50);
  const d = descriviEsito({ esito: 'obbligatorio', motivi: ['rischio_elevato', 'dpo_37'] }, L);
  check(`result text lists the reasons (${lang})`, d.testo === L.esiti.obbligatorio + ' — ' + L.motivi.rischio_elevato + '; ' + L.motivi.dpo_37);
  const E = loc.enums;
  check(`enum labels match the application codes (${lang})`,
    eq(Object.keys(E.personeImpiegate), Object.values(S.PERSONE_IMPIEGATE))
    && eq(Object.keys(E.naturaOrganizzazione), Object.values(S.NATURA_ORGANIZZAZIONE))
    && eq(Object.keys(E.baseDesignazioneDpo), Object.values(S.BASE_DESIGNAZIONE_DPO))
    && eq(Object.keys(E.valutazione), Object.values(S.VALUTAZIONE))
    && eq(Object.keys(E.casiArt35par3), Object.values(S.CASI_ART35_PAR3)));
  check(`organisation sheet labels and regime texts (${lang})`,
    ['onbSezioneObbligo', 'lblPersoneImpiegate', 'lblNaturaOrg', 'lblDpoBase', 'optNonIndicato', 'obbRegimeVigente', 'filtroObbligoLabel', 'estrattoObbligo', 'editorEsitoTitolo'].every((k) => loc.ui[k])
    && loc.ui.obbRegimeOmnibus.includes('{riferimento}') && loc.ui.obbRegimeOmnibus.includes('{data}'));
}
const common = JSON.parse(readFileSync(new URL('../public/schema/v1/common.schema.json', import.meta.url), 'utf8'));
const consts = (def) => (common.$defs[def].oneOf || []).map((o) => o.const);
check('code lists in the data specification match the application',
  eq(consts('personsEmployed'), Object.values(S.PERSONE_IMPIEGATE))
  && eq(consts('organisationNature'), Object.values(S.NATURA_ORGANIZZAZIONE))
  && eq(consts('dpoDesignationBasis'), Object.values(S.BASE_DESIGNAZIONE_DPO))
  && eq(consts('assessment'), Object.values(S.VALUTAZIONE))
  && eq(consts('caseArt35par3'), Object.values(S.CASI_ART35_PAR3)));

// ---------------------------------------------------------------------------
console.log('5. Editor (section 13) and detail');
for (const regime of ['vigente', 'omnibus4']) {
  const deps = { lingue: ['it'], detail: localeIt.detail, enums: localeIt.enums, guida: localeIt.guida, regime, noteObbligo: localeIt.obbligo.note };
  const m = buildEditModel(att({}), deps);
  const sez = m.sezioni.find((s) => s.id === 'obbligo');
  const vis = sez.campi.filter((c) => c.visibile).map((c) => c.chiave);
  const atteso = regime === 'omnibus4' ? ['obRischioElevato', 'obCasiArt35', 'obAttivitaDpo', 'obMotivazione'] : ['obRischio', 'obNonOccasionale', 'obMotivazione'];
  check(`section 13 shows only the questions of the version applied (${regime})`, eq(vis, atteso), vis.join(', '));
  check(`section 13 note for the version applied (${regime})`, sez.nota === localeIt.obbligo.note[regime]);
  check(`section 13 is the 13th section (${regime})`, m.sezioni.length === 13 && m.sezioni[12].id === 'obbligo');
}
{
  const deps = { lingue: ['it'], detail: localeIt.detail, enums: localeIt.enums, regime: 'vigente' };
  const rec = att({ rischioElevato: 'si', casiArt35par3: ['c'] });
  const m = buildEditModel(rec, deps);
  const c = m.sezioni[12].campi.find((x) => x.chiave === 'obRischio'); c.val = 'si';
  const out = applyEditModel(JSON.parse(JSON.stringify(rec)), m);
  check('answers of the other version are kept when saving', out.obbligoRegistrazione.rischioElevato === 'si' && eq(out.obbligoRegistrazione.casiArt35par3, ['c']) && out.obbligoRegistrazione.rischio === 'si');
  const m2 = buildEditModel({ ...rec, obbligoRegistrazione: undefined }, deps);
  check('missing answers are shown as "to be assessed"', m2.sezioni[12].campi.filter((x) => x.isEnum1).every((x) => x.val === 'da_valutare'));
}
{
  const base = { detail: localeIt.detail, enums: localeIt.enums };
  check('detail without context: 12 sections (exports of earlier versions unchanged)', buildDettaglio(att({}), 'it', base).sezioni.length === 12);
  const d = buildDettaglio(att({ rischio: 'si' }), 'it', { ...base, obbligo: { settings: org('meno250', 'privata'), regime: 'vigente', L: localeIt.obbligo } });
  const s13 = d.sezioni[12];
  check('detail with context: section 13 with the result first', d.sezioni.length === 13 && s13.id === 'obbligo'
    && s13.campi[0].value === localeIt.obbligo.esiti.obbligatorio + ' — ' + localeIt.obbligo.motivi.rischio);
  const dO = buildDettaglio(att({ rischioElevato: 'no', casiArt35par3: [], attivitaPrincipaleDpo: 'no' }), 'en', { detail: localeEn.detail, enums: localeEn.enums, obbligo: { settings: org('da250a999', 'privata'), regime: 'omnibus4', L: localeEn.obbligo } });
  check('detail (Omnibus IV, English): voluntary result and its questions',
    dO.sezioni[12].campi[0].value === localeEn.obbligo.esiti.volontario && dO.sezioni[12].campi.length === 5);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

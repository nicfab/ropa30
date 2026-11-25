/*
 * ropa30 — obbligo.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PURE module: indicative assessment of the obligation to record a processing
 * activity under Art. 30(5) GDPR. No Alpine, no DOM: unit-testable in Node.
 *
 * Two versions of Art. 30(5) are supported:
 *  - 'vigente'  : text in force. Enterprises and organisations employing fewer
 *                 than 250 persons must record the processing that is likely to
 *                 result in a risk to the rights and freedoms of data subjects,
 *                 is not occasional, or includes special categories of data
 *                 (Art. 9(1)) or personal data relating to criminal convictions
 *                 and offences (Art. 10).
 *  - 'omnibus4' : text amended by the Omnibus IV Regulation. Enterprises and
 *                 organisations employing fewer than 1000 persons must record
 *                 only the processing likely to result in a high risk within
 *                 the meaning of Art. 35 (in particular the cases of Art. 35(3))
 *                 and, in any event, core activities requiring the designation
 *                 of a DPO under Art. 37(1)(b) or (c). Public authorities and
 *                 bodies do not benefit from the derogation (recital 8).
 *
 * The result is indicative: it does not replace the assessment of the
 * controller or processor. Values not yet assessed lead to a prudential
 * "obligatory" result.
 *
 * API
 *   regimeInVigore(date, omnibus) -> 'vigente' | 'omnibus4'
 *   valutaObbligo(record, settings, regime) -> { esito, motivi }
 *     esito  : 'obbligatorio' | 'prudenziale' | 'volontario'
 *     motivi : codes, in order (see MOTIVI)
 *   registrazioneDovuta(esito) -> boolean (obligatory, also prudentially)
 */

export const ESITO = {
  OBBLIGATORIO: 'obbligatorio',
  PRUDENZIALE:  'prudenziale',
  VOLONTARIO:   'volontario'
};

export const MOTIVI = [
  'org_250', 'org_1000', 'pubblica', 'persone_non_indicate', 'natura_non_indicata',
  'rischio', 'non_occasionale', 'art9', 'art10',
  'rischio_elevato', 'art35_3', 'dpo_37', 'da_valutare'
];

// Date (ISO yyyy-mm-dd or Date) from which the Omnibus IV text applies.
export function regimeInVigore(date, omnibus) {
  const dal = omnibus && omnibus.inVigoreDal;
  if (!dal) return 'vigente';
  const oggi = (date instanceof Date ? date : new Date(date || Date.now())).toISOString().slice(0, 10);
  return oggi >= String(dal).slice(0, 10) ? 'omnibus4' : 'vigente';
}

function risposta(v) {
  return (v === 'si' || v === 'no') ? v : 'da_valutare';
}

export function valutaObbligo(record, settings, regime) {
  const r = record || {};
  const ob = r.obbligoRegistrazione || {};
  const org = (settings && settings.obbligoRegistro) || {};
  const persone = org.personeImpiegate || '';
  const natura = org.natura || '';
  const motivi = [];

  if (regime === 'omnibus4') {
    if (natura === 'pubblica') return { esito: ESITO.OBBLIGATORIO, motivi: ['pubblica'] };
    if (persone === 'almeno1000') return { esito: ESITO.OBBLIGATORIO, motivi: ['org_1000'] };
    const casi = Array.isArray(ob.casiArt35par3) ? ob.casiArt35par3.filter((c) => ['a', 'b', 'c'].includes(c)) : [];
    const rischioElevato = risposta(ob.rischioElevato);
    const dpo = risposta(ob.attivitaPrincipaleDpo);
    if (rischioElevato === 'si') motivi.push('rischio_elevato');
    if (casi.length) motivi.push('art35_3');
    if (dpo === 'si') motivi.push('dpo_37');
    if (motivi.length) return { esito: ESITO.OBBLIGATORIO, motivi };
    const prud = [];
    if (!persone) prud.push('persone_non_indicate');
    if (!natura) prud.push('natura_non_indicata');
    if (rischioElevato === 'da_valutare' || dpo === 'da_valutare') prud.push('da_valutare');
    if (prud.length) return { esito: ESITO.PRUDENZIALE, motivi: prud };
    return { esito: ESITO.VOLONTARIO, motivi: [] };
  }

  // Text in force.
  if (persone === 'da250a999' || persone === 'almeno1000') return { esito: ESITO.OBBLIGATORIO, motivi: ['org_250'] };
  const rischio = risposta(ob.rischio);
  const nonOcc = risposta(ob.nonOccasionale);
  const art9 = Array.isArray(r.baseGiuridica && r.baseGiuridica.art9) && r.baseGiuridica.art9.length > 0;
  const art10 = !!(r.datiCondannePenaliReati && r.datiCondannePenaliReati.presenti);
  if (rischio === 'si') motivi.push('rischio');
  if (nonOcc === 'si') motivi.push('non_occasionale');
  if (art9) motivi.push('art9');
  if (art10) motivi.push('art10');
  if (motivi.length) return { esito: ESITO.OBBLIGATORIO, motivi };
  const prud = [];
  if (!persone) prud.push('persone_non_indicate');
  if (rischio === 'da_valutare' || nonOcc === 'da_valutare') prud.push('da_valutare');
  if (prud.length) return { esito: ESITO.PRUDENZIALE, motivi: prud };
  return { esito: ESITO.VOLONTARIO, motivi: [] };
}

export function registrazioneDovuta(esito) {
  return esito === ESITO.OBBLIGATORIO || esito === ESITO.PRUDENZIALE;
}

// Labels for the UI and the exports. L = locale.obbligo:
//   { esiti: {code: label}, motivi: {code: label}, motiviPrefisso }
export function descriviEsito(valutazione, L) {
  const v = valutazione || { esito: ESITO.PRUDENZIALE, motivi: [] };
  const lab = (L && L.esiti) || {};
  const mot = (L && L.motivi) || {};
  const motivi = (v.motivi || []).map((m) => mot[m] || m);
  const label = lab[v.esito] || v.esito;
  return {
    esito: v.esito,
    label,
    motivi,
    testo: motivi.length ? label + ' — ' + motivi.join('; ') : label
  };
}

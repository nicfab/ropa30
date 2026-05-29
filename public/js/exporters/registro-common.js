/*
 * ropa30 — exporters/registro-common.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PURE shared model for tabular exports (XLSX / ODS). Turns the processing
 * activities into a neutral { headers, rows, meta } table by flattening
 * buildDettaglio() output — one row per activity, one column per Art.30 field.
 * No DOM, no DB, no window: unit-testable in Node. The XLSX and ODS exporters
 * consume this identical model so the three outputs stay coherent.
 *
 * Column set is the ORDERED UNION of fields seen across all activities (order
 * of first appearance), so conditional sections (e.g. legitimate interest)
 * still get a column, and activities lacking them leave that cell empty.
 */

import { buildDettaglio } from '../detail.js';

// Serialize a single detail Field to a flat cell string.
function cellaDaCampo(campo, vuoto) {
  if (!campo) return vuoto;
  switch (campo.tipo) {
    case 'lista': {
      const items = Array.isArray(campo.items) ? campo.items : [];
      const parts = items.map((i) => (i && i.value) || '').filter((v) => v && v !== vuoto);
      return parts.length ? parts.join('; ') : vuoto;
    }
    case 'gruppi': {
      const gruppi = Array.isArray(campo.gruppi) ? campo.gruppi : [];
      if (!gruppi.length) return vuoto;
      const blocchi = gruppi.map((g, idx) => {
        const campi = Array.isArray(g.campi) ? g.campi : [];
        const coppie = campi
          .map((c) => (c && c.label ? c.label + ': ' + (c.value || '') : ''))
          .filter(Boolean);
        return '#' + (idx + 1) + ' ' + coppie.join('; ');
      });
      return blocchi.join('\n');
    }
    default:
      // testo | data | enum | bool
      return (campo.value === undefined || campo.value === null || campo.value === '')
        ? vuoto
        : String(campo.value);
  }
}

// Build the neutral tabular model of the whole register.
//   records   : array of processing activities (schema v2)
//   lang      : 'it' | 'en'
//   deps      : { detail, enums }  (locale.detail, locale.enums)
//   titolare  : settings.titolare object (for meta)
// Returns { headers, rows, meta }.
export function buildModelloRegistro(records, lang, deps, titolare = {}) {
  const vuoto = (deps && deps.detail && deps.detail.stati && deps.detail.stati.vuoto) || '—';
  const list = Array.isArray(records) ? records : [];

  // First pass: build each activity's flat field map, and accumulate the
  // ORDERED UNION of column labels (order of first appearance).
  const headers = [];
  const seen = new Set();
  const flatPerRecord = [];

  for (const rec of list) {
    const dett = buildDettaglio(rec, lang, deps);
    const sezioni = (dett && Array.isArray(dett.sezioni)) ? dett.sezioni : [];
    const flat = new Map();
    for (const sez of sezioni) {
      const campi = Array.isArray(sez.campi) ? sez.campi : [];
      for (const campo of campi) {
        if (!campo || !campo.label) continue;
        if (!seen.has(campo.label)) { seen.add(campo.label); headers.push(campo.label); }
        flat.set(campo.label, cellaDaCampo(campo, vuoto));
      }
    }
    flatPerRecord.push(flat);
  }

  // Second pass: emit one row per activity, aligned to the union headers.
  const rows = flatPerRecord.map((flat) =>
    headers.map((h) => (flat.has(h) ? flat.get(h) : vuoto))
  );

  const meta = {
    titolare: (titolare && titolare.denominazione) || '',
    titolareRighe: (titolare && Array.isArray(titolare.righe)) ? titolare.righe : [],
    estratto: (titolare && titolare.estratto) || { estratto: false, unita: '' },
    generatoIl: new Date().toISOString(),
    lingua: lang,
    conteggio: list.length
  };

  return { headers, rows, meta };
}

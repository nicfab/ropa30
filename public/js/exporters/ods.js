/*
 * ropa30 — exporters/ods.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Native OpenDocument Spreadsheet (.ods) export of the whole register.
 * Consumes the neutral { headers, rows, meta } model and writes a minimal but
 * VALID .ods that LibreOffice opens cleanly: a single-table content.xml plus
 * the required mimetype and manifest, packaged as a ZIP via fflate (vendored
 * locally as window.fflate). No styling beyond what is needed for validity;
 * interoperability first. Download is CSP-safe (Blob + synthetic <a download>).
 *
 * ODS packaging rules respected:
 *   - 'mimetype' is the FIRST entry and STORED (uncompressed, level 0)
 *   - META-INF/manifest.xml lists every part
 *   - content.xml holds the table (office:value-type="string" cells)
 */

import { nomeFileRegistro } from './xlsx.js';

// XML-escape text content / attribute values.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// A table cell containing a (possibly multi-line) string. Newlines become
// <text:line-break/> so multi-row groups stay readable inside one cell.
function cellaXml(value) {
  const parts = String(value == null ? '' : value).split('\n');
  const paras = parts.map((p) => '<text:p>' + esc(p) + '</text:p>').join('');
  return '<table:table-cell office:value-type="string">' + paras + '</table:table-cell>';
}

// A full table row from an array of string cells.
function rigaXml(cells) {
  return '<table:table-row>' + cells.map(cellaXml).join('') + '</table:table-row>';
}

// Build the content.xml document for the register table.
function contentXml(model, labels) {
  const est = model.meta.estratto || { estratto: false, unita: '' };
  const titoloBase = est.estratto
    ? (labels.estrattoTitolo || 'Estratto del Registro')
    : (labels.titolo || 'Registro dei trattamenti');
  const titolo = titoloBase + (model.meta.titolare ? ' — ' + model.meta.titolare : '');
  const generato = (labels.generatoIl || 'Generato il') + ': ' + model.meta.generatoIl;

  // Sheet 'Titolare' table (label/value rows).
  const righe = Array.isArray(model.meta.titolareRighe) ? model.meta.titolareRighe : [];
  let tabellaTitolare = '';
  if (righe.length) {
    const tRows = [];
    tRows.push(rigaXml([labels.titolareTitolo || 'Dati del titolare']));
    if (est.estratto) tRows.push(rigaXml([(labels.estrattoUnita || 'Unità') + ': ' + est.unita]));
    tRows.push(rigaXml(['']));
    for (const r of righe) tRows.push(rigaXml([r.label, r.value]));
    tabellaTitolare = '<table:table table:name="Titolare">'
      + '<table:table-column table:number-columns-repeated="2"/>'
      + tRows.join('')
      + '</table:table>';
  }

  // Top info rows (single cell each), a spacer, then header row + data rows.
  const rows = [];
  rows.push(rigaXml([titolo]));
  if (est.estratto) rows.push(rigaXml([(labels.estrattoUnita || 'Unità') + ': ' + est.unita]));
  rows.push(rigaXml([generato]));
  rows.push(rigaXml(['']));
  rows.push(rigaXml(model.headers));
  for (const r of model.rows) rows.push(rigaXml(r));

  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<office:document-content'
    + ' xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"'
    + ' xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"'
    + ' xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"'
    + ' office:version="1.2">'
    + '<office:body><office:spreadsheet>'
    + tabellaTitolare
    + '<table:table table:name="Registro">'
    + '<table:table-column table:number-columns-repeated="' + Math.max(1, model.headers.length) + '"/>'
    + rows.join('')
    + '</table:table>'
    + '</office:spreadsheet></office:body>'
    + '</office:document-content>';
}

const MANIFEST_XML = '<?xml version="1.0" encoding="UTF-8"?>'
  + '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">'
  + '<manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/>'
  + '<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>'
  + '</manifest:manifest>';

const MIMETYPE = 'application/vnd.oasis.opendocument.spreadsheet';

// Export the register model as a .ods file. Returns the filename.
export function esportaRegistroOds(model, labels = {}, date = new Date()) {
  const fflate = window.fflate;
  if (!fflate) throw new Error('FFLATE_NOT_AVAILABLE');

  const enc = new TextEncoder();
  const files = {
    // mimetype MUST be first and stored (uncompressed).
    'mimetype': [enc.encode(MIMETYPE), { level: 0 }],
    'META-INF/manifest.xml': enc.encode(MANIFEST_XML),
    'content.xml': enc.encode(contentXml(model, labels))
  };

  const zipped = fflate.zipSync(files, { level: 6 });
  const blob = new Blob([zipped], { type: MIMETYPE });

  const url = URL.createObjectURL(blob);
  const filename = nomeFileRegistro('ods', date, model.meta.estratto);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return filename;
}

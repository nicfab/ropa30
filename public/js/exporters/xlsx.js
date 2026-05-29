/*
 * ropa30 — exporters/xlsx.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * XLSX export of the whole register. Consumes the neutral { headers, rows, meta }
 * model from registro-common.js and builds a single-sheet workbook via SheetJS
 * (vendored locally as window.XLSX — used ONLY for writing). Download is
 * CSP-safe (Blob + synthetic <a download>), mirroring exporters/backup.js.
 */

// Build a filesystem-friendly filename: ropa30-registro-YYYYMMDD-HHMMSS.xlsx
export function nomeFileRegistro(ext, date = new Date(), estratto = null) {
  const p = (n) => String(n).padStart(2, '0');
  const Y = date.getFullYear();
  const M = p(date.getMonth() + 1);
  const D = p(date.getDate());
  const h = p(date.getHours());
  const m = p(date.getMinutes());
  const s = p(date.getSeconds());
  let tipo = 'registro-completo';
  if (estratto && estratto.estratto) {
    const slug = String(estratto.unita || '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unita';
    tipo = 'estratto-unita-' + slug;
  }
  return 'ropa30-' + tipo + '-' + Y + M + D + '-' + h + m + s + '.' + ext;
}

// Trigger a download for an in-memory byte array / blob.
function scaricaBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
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
}

// Export the register model as an .xlsx file. Returns the filename.
// labels = { titolo, generatoIl, titolare } localized strings for the header rows.
export function esportaRegistroXlsx(model, labels = {}, date = new Date()) {
  const XLSX = window.XLSX;
  if (!XLSX) throw new Error('XLSX_NOT_AVAILABLE');

  const headerRows = [];
  const est = model.meta.estratto || { estratto: false, unita: '' };
  const titoloBase = est.estratto
    ? (labels.estrattoTitolo || 'Estratto del Registro')
    : (labels.titolo || 'Registro dei trattamenti');
  headerRows.push([titoloBase + (model.meta.titolare ? ' — ' + model.meta.titolare : '')]);
  if (est.estratto) {
    headerRows.push([(labels.estrattoUnita || 'Unità') + ': ' + est.unita]);
  }
  headerRows.push([(labels.generatoIl || 'Generato il') + ': ' + model.meta.generatoIl]);
  headerRows.push([]); // spacer

  const aoa = headerRows
    .concat([model.headers])
    .concat(model.rows);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Reasonable default column widths (chars), capped to keep the sheet usable.
  ws['!cols'] = model.headers.map(() => ({ wch: 28 }));

  const wb = XLSX.utils.book_new();
  const righe = Array.isArray(model.meta.titolareRighe) ? model.meta.titolareRighe : [];
  if (righe.length) {
    const tAoa = [[labels.titolareTitolo || 'Dati del titolare']];
    if (est.estratto) tAoa.push([(labels.estrattoUnita || 'Unità') + ': ' + est.unita]);
    tAoa.push([]);
    for (const r of righe) tAoa.push([r.label, r.value]);
    const wsT = XLSX.utils.aoa_to_sheet(tAoa);
    wsT['!cols'] = [{ wch: 24 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsT, 'Titolare');
  }
  XLSX.utils.book_append_sheet(wb, ws, 'Registro');

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const filename = nomeFileRegistro('xlsx', date, model.meta.estratto);
  scaricaBlob(blob, filename);
  return filename;
}

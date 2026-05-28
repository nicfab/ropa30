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
export function nomeFileRegistro(ext, date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const Y = date.getFullYear();
  const M = p(date.getMonth() + 1);
  const D = p(date.getDate());
  const h = p(date.getHours());
  const m = p(date.getMinutes());
  const s = p(date.getSeconds());
  return 'ropa30-registro-' + Y + M + D + '-' + h + m + s + '.' + ext;
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
  // Two info rows on top: register title + owner, and generation timestamp.
  const titolo = labels.titolo || 'Registro dei trattamenti';
  headerRows.push([titolo + (model.meta.titolare ? ' — ' + model.meta.titolare : '')]);
  headerRows.push([(labels.generatoIl || 'Generato il') + ': ' + model.meta.generatoIl]);
  headerRows.push([]); // spacer

  const aoa = headerRows
    .concat([model.headers])
    .concat(model.rows);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Reasonable default column widths (chars), capped to keep the sheet usable.
  ws['!cols'] = model.headers.map(() => ({ wch: 28 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registro');

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const filename = nomeFileRegistro('xlsx', date);
  scaricaBlob(blob, filename);
  return filename;
}

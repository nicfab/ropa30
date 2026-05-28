/*
 * ropa30 — exporters/backup.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Full-backup serialization + download. This module does NOT touch the
 * database: it receives a ready-made envelope (from db.exportAllData()) and
 * is responsible only for (1) building a safe, dated filename and (2) turning
 * the envelope into a downloadable JSON file under a strict CSP (no inline,
 * no network): Blob + URL.createObjectURL + a synthetic <a download>.
 *
 * The exported JSON is NOT encrypted: it contains personal data. The UI must
 * warn the user to keep the file in a safe place (handled in the locales).
 */

// ----------------------------------------------------------------------------
// Filename: ropa30-backup-YYYYMMDD-HHMMSS.json (LOCAL time, digits + hyphens
// only — no spaces, colons or other filesystem-unfriendly characters).
// Exported separately so it can be unit-tested in Node without a DOM.
// ----------------------------------------------------------------------------
export function nomeFileBackup(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const Y = date.getFullYear();
  const M = p(date.getMonth() + 1);
  const D = p(date.getDate());
  const h = p(date.getHours());
  const m = p(date.getMinutes());
  const s = p(date.getSeconds());
  return `ropa30-backup-${Y}${M}${D}-${h}${m}${s}.json`;
}

// ----------------------------------------------------------------------------
// Trigger a download of the given backup envelope as a pretty-printed JSON
// file. Returns the filename used. Throws on serialization failure so the
// caller (app.js) can surface a localized error.
// ----------------------------------------------------------------------------
export function scaricaBackup(envelope, date = new Date()) {
  const filename = nomeFileBackup(date);
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
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
    // Revoke on the next tick so the download has surely started.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return filename;
}

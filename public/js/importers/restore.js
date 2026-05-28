/*
 * ropa30 — importers/restore.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * File-reading side of the restore flow, the mirror of exporters/backup.js.
 * Under a strict CSP (no inline, no network) it reads a user-picked File via
 * FileReader and parses it as JSON. It does NOT validate the envelope shape
 * (that is validateBackupEnvelope) and does NOT touch the database
 * (that is db.importAllData). It only turns a File into a JS object, mapping
 * low-level failures to stable error codes the UI can localize:
 *   READ_ERROR  — the file could not be read
 *   EMPTY_FILE  — the file is empty
 *   PARSE_ERROR — the content is not valid JSON
 */

// Read a File and resolve with the parsed JSON object. Rejects with an Error
// whose message is one of the stable codes above.
export function leggiFileBackup(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('READ_ERROR'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('READ_ERROR'));
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      if (!text.trim()) {
        reject(new Error('EMPTY_FILE'));
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (e) {
        reject(new Error('PARSE_ERROR'));
      }
    };
    reader.readAsText(file);
  });
}

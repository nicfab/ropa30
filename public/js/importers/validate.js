/*
 * ropa30 — importers/validate.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PURE validation of a backup envelope. No database, no DOM: depends only on
 * version constants from schema.js, so it is unit-testable in Node and can be
 * reused by both the UI (to preview a file) and db.importAllData (to guard the
 * restore). Returns a structured { ok, errors, summary } — never throws.
 */

import { EXPORT_FORMAT_VERSION } from '../schema.js';

export function validateBackupEnvelope(obj) {
  const errors = [];
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

  if (!isObj(obj)) {
    return { ok: false, errors: ['NOT_AN_OBJECT'], summary: null };
  }

  const meta = isObj(obj._meta) ? obj._meta : {};
  const data = isObj(obj.data) ? obj.data : null;

  const efv = meta.exportFormatVersion;
  if (typeof efv === 'number' && efv > EXPORT_FORMAT_VERSION) {
    errors.push('FORMAT_TOO_NEW');
  }

  if (!data) {
    errors.push('MISSING_DATA');
  } else {
    if (!Array.isArray(data.settings)) errors.push('MISSING_SETTINGS');
    if (!Array.isArray(data.processingActivities)) errors.push('MISSING_PROCESSING_ACTIVITIES');
    if (!Array.isArray(data.auditLog)) errors.push('MISSING_AUDIT_LOG');

    if (Array.isArray(data.processingActivities)) {
      const bad = data.processingActivities.some(
        (r) => !isObj(r) || typeof r.id !== 'string'
      );
      if (bad) errors.push('INVALID_PROCESSING_ACTIVITY');
    }
  }

  const summary = {
    app: meta.app || null,
    exportFormatVersion: typeof efv === 'number' ? efv : null,
    schemaVersion: typeof meta.schemaVersion === 'number' ? meta.schemaVersion : null,
    exportedAt: typeof meta.exportedAt === 'string' ? meta.exportedAt : null,
    counts: data
      ? {
          settings: Array.isArray(data.settings) ? data.settings.length : 0,
          processingActivities: Array.isArray(data.processingActivities) ? data.processingActivities.length : 0,
          auditLog: Array.isArray(data.auditLog) ? data.auditLog.length : 0
        }
      : null
  };

  return { ok: errors.length === 0, errors, summary };
}

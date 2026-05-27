/*
 * ropa30 — db.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Persistence layer for ropa30.
 *
 * Wraps Dexie.js over IndexedDB to provide a clean async CRUD API
 * for the three object stores defined in the schema:
 *
 *   - settings              (singleton: controller + DPO info)
 *   - processingActivities  (one record per ROPA entry)
 *   - auditLog              (history of changes — accountability)
 *
 * All data is stored locally in the user's browser. Nothing is ever
 * sent to a server. This is enforced both by design (no fetch/XHR
 * outbound calls) and by the page-level Content Security Policy
 * (connect-src 'self').
 *
 * Dexie is loaded as a global from public/js/lib/dexie.min.js via the
 * window.Dexie property (the UMD build exposes it on window).
 */

import {
  SCHEMA_VERSION,
  DEFAULT_TENANT_ID,
  AUDIT_AZIONE,
  AUDIT_TARGET,
  createDefaultSettings,
  createDefaultProcessingActivity,
  createAuditEntry
} from './schema.js';

// ============================================================================
// DATABASE INSTANCE
// ============================================================================
// Dexie is loaded as a global by index.html (window.Dexie).
const Dexie = window.Dexie;
if (!Dexie) {
  throw new Error('Dexie.js is not loaded. Check the <script> order in index.html.');
}

const db = new Dexie('ropa30');

// ----------------------------------------------------------------------------
// Schema versioning policy
// ----------------------------------------------------------------------------
// Dexie tracks IndexedDB schema versions via db.version(N).stores({...}).
// When the user's IndexedDB has an older version, Dexie applies migrations
// in order: version(1) → version(2) → ... → current.
//
// Our app-level schema version (data shape inside each record) is tracked
// separately in SCHEMA_VERSION (from schema.js) and stamped on every record.
//
// IndexedDB version 1 — initial release.
// Indices declared with '&' = unique primary key.
// Other indices listed after the primary key allow efficient queries.
db.version(1).stores({
  settings:            '&id, tenantId',
  processingActivities:'&id, tenantId, tipoRegistro, codiceUtente, nome, [tenantId+tipoRegistro]',
  auditLog:            '&id, tenantId, timestamp, targetType, targetId'
});

// ============================================================================
// UUID GENERATION
// ============================================================================
// Use the browser's built-in crypto.randomUUID() (RFC 4122 v4).
// Available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+).
function newUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  throw new Error(
    'crypto.randomUUID() is not available in this browser. ' +
    'ropa30 requires a modern browser (Chrome 92+, Firefox 95+, Safari 15.4+).'
  );
}

// ============================================================================
// AUDIT LOG (internal helper)
// ============================================================================
async function logAudit({ azione, targetType, targetId, summary }) {
  const entry = createAuditEntry({
    id: newUUID(),
    azione,
    targetType,
    targetId,
    summary
  });
  await db.auditLog.add(entry);
  return entry;
}

// ============================================================================
// SETTINGS API
// ============================================================================

/**
 * Get the current settings record. If none exists yet (first run),
 * creates and persists a default empty one.
 * @returns {Promise<object>} the settings record
 */
export async function getSettings() {
  let settings = await db.settings.get('default');
  if (!settings) {
    settings = createDefaultSettings();
    await db.settings.add(settings);
    await logAudit({
      azione: AUDIT_AZIONE.CREATED,
      targetType: AUDIT_TARGET.SETTINGS,
      targetId: 'default',
      summary: 'Initialized default settings on first run'
    });
  }
  return settings;
}

/**
 * Update the settings record.
 * @param {object} patch — partial settings object (will be deep-merged shallowly).
 * @returns {Promise<object>} the updated settings record
 */
export async function updateSettings(patch) {
  const current = await getSettings();
  const updated = {
    ...current,
    ...patch,
    id: 'default',                 // never let the id be overwritten
    tenantId: DEFAULT_TENANT_ID,   // ditto
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      ...current.metadata,
      updatedAt: new Date().toISOString()
    }
  };
  await db.settings.put(updated);
  await logAudit({
    azione: AUDIT_AZIONE.UPDATED,
    targetType: AUDIT_TARGET.SETTINGS,
    targetId: 'default',
    summary: 'Settings updated'
  });
  return updated;
}

// ============================================================================
// PROCESSING ACTIVITIES API
// ============================================================================

/**
 * Create a new processing activity. Generates a fresh UUID.
 * @param {object} initial — fields to pre-fill (optional).
 * @returns {Promise<object>} the newly created activity record
 */
export async function createProcessingActivity(initial = {}) {
  const record = createDefaultProcessingActivity({ id: newUUID() });
  Object.assign(record, initial, {
    id: record.id,                 // protect the id
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,
    metadata: record.metadata
  });
  await db.processingActivities.add(record);
  await logAudit({
    azione: AUDIT_AZIONE.CREATED,
    targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: record.id,
    summary: `Created processing activity "${record.nome || record.id}"`
  });
  return record;
}

/**
 * Read a processing activity by id.
 * @param {string} id
 * @returns {Promise<object|undefined>}
 */
export async function getProcessingActivity(id) {
  return await db.processingActivities.get(id);
}

/**
 * List all processing activities of the current tenant and current
 * register type (titolare by default).
 * @returns {Promise<Array<object>>}
 */
export async function listProcessingActivities() {
  return await db.processingActivities
    .where('[tenantId+tipoRegistro]')
    .equals([DEFAULT_TENANT_ID, 'titolare'])
    .toArray();
}

/**
 * Update a processing activity. Increments its internal version number
 * and refreshes updatedAt.
 * @param {string} id
 * @param {object} patch — partial fields to overwrite
 * @returns {Promise<object>} the updated record
 */
export async function updateProcessingActivity(id, patch) {
  const current = await db.processingActivities.get(id);
  if (!current) throw new Error(`Processing activity ${id} not found`);
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      ...current.metadata,
      updatedAt: new Date().toISOString(),
      version: (current.metadata?.version || 1) + 1
    }
  };
  await db.processingActivities.put(updated);
  await logAudit({
    azione: AUDIT_AZIONE.UPDATED,
    targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: id,
    summary: `Updated processing activity "${updated.nome || id}"`
  });
  return updated;
}

/**
 * Delete a processing activity permanently.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteProcessingActivity(id) {
  const current = await db.processingActivities.get(id);
  if (!current) return;
  await db.processingActivities.delete(id);
  await logAudit({
    azione: AUDIT_AZIONE.DELETED,
    targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: id,
    summary: `Deleted processing activity "${current.nome || id}"`
  });
}

// ============================================================================
// AUDIT LOG API (read-only from outside)
// ============================================================================

/**
 * List audit log entries in reverse chronological order.
 * @param {number} limit — maximum entries to return (default: 100)
 * @returns {Promise<Array<object>>}
 */
export async function listAuditLog(limit = 100) {
// Order by timestamp descending. We use `orderBy('timestamp')` + `reverse()`
  // because the natural index on auditLog does not guarantee chronological
  // order across rapid sequential writes (same-millisecond timestamps).
  const all = await db.auditLog
    .where('tenantId').equals(DEFAULT_TENANT_ID)
    .toArray();
  return all
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

// ============================================================================
// EXPORTS (the db instance is exported too, for debugging in console)
// ============================================================================
export { db };

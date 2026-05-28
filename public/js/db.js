/*
 * ropa30 — db.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Persistence layer for ropa30 (Dexie over IndexedDB). All data stays local.
 * Schema v2 (multilingual). Contains the v1->v2 migration and a bilingual
 * template factory (no flattening: presets keep both languages).
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
const Dexie = window.Dexie;
if (!Dexie) {
  throw new Error('Dexie.js is not loaded. Check the <script> order in index.html.');
}

const db = new Dexie('ropa30');

db.version(1).stores({
  settings:            '&id, tenantId',
  processingActivities:'&id, tenantId, tipoRegistro, codiceUtente, nome, [tenantId+tipoRegistro]',
  auditLog:            '&id, tenantId, timestamp, targetType, targetId'
});

// ============================================================================
// MIGRATION HELPERS (v1 -> v2)
// ============================================================================
function isBilingue(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    && ('it' in v) && ('en' in v)
    && Object.keys(v).every((k) => k === 'it' || k === 'en');
}
function toBil(v, lang) {
  if (isBilingue(v)) return { it: v.it || '', en: v.en || '' };
  const s = (typeof v === 'string') ? v : '';
  return lang === 'en' ? { it: '', en: s } : { it: s, en: '' };
}
function toBilArray(arr, lang) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => toBil(item, lang));
}
function migrateProcessingActivityV1toV2(rec, lang) {
  const r = { ...rec };
  r.nome = toBil(r.nome, lang);
  r.descrizione = toBil(r.descrizione, lang);
  r.finalita = toBilArray(r.finalita, lang);

  const bg = { ...(r.baseGiuridica || {}) };
  bg.art6 = Array.isArray(bg.art6) ? bg.art6 : [];
  bg.art9 = Array.isArray(bg.art9) ? bg.art9 : [];
  bg.dettagliArt6 = toBil(bg.dettagliArt6, lang);
  bg.dettagliArt9 = toBil(bg.dettagliArt9, lang);
  const li = { ...(bg.legittimoInteresseDettagli || {}) };
  li.descrizione = toBil(li.descrizione, lang);
  li.garanzieAdottate = toBil(li.garanzieAdottate, lang);
  li.riferimentoBilanciamento = toBil(li.riferimentoBilanciamento, lang);
  li.bilanciamentoEffettuato = !!li.bilanciamentoEffettuato;
  li.bilanciamentoRichiesto = (li.bilanciamentoRichiesto !== undefined) ? !!li.bilanciamentoRichiesto : true;
  bg.legittimoInteresseDettagli = li;
  r.baseGiuridica = bg;

  const cp = { ...(r.datiCondannePenaliReati || {}) };
  cp.presenti = !!cp.presenti;
  cp.normativaAutorizzativa = toBil(cp.normativaAutorizzativa, lang);
  r.datiCondannePenaliReati = cp;

  r.categorieInteressati = toBilArray(r.categorieInteressati, lang);
  r.categorieDati = toBilArray(r.categorieDati, lang);
  r.fonteDeiDatiDettagli = toBil(r.fonteDeiDatiDettagli, lang);

  r.categorieDestinatari = toBilArray(r.categorieDestinatari, lang);
  r.responsabiliEsterni = Array.isArray(r.responsabiliEsterni)
    ? r.responsabiliEsterni.map((re) => {
        const x = { ...(re || {}) };
        x.denominazione = toBil(x.denominazione, lang);
        x.sede = toBil(x.sede, lang);
        x.finalita = toBil(x.finalita, lang);
        x.riferimentoContratto = toBil(x.riferimentoContratto, lang);
        x.notaRuoloPrivacy = toBil(x.notaRuoloPrivacy, lang);
        x.accordoArt28Presente = !!x.accordoArt28Presente;
        return x;
      })
    : [];

  r.trasferimentiExtraUE = Array.isArray(r.trasferimentiExtraUE)
    ? r.trasferimentiExtraUE.map((tr) => {
        const x = { ...(tr || {}) };
        x.paese = toBil(x.paese, lang);
        x.riferimentoDocumentazione = toBil(x.riferimentoDocumentazione, lang);
        return x;
      })
    : [];

  const tc = { ...(r.tempiConservazione || {}) };
  tc.periodo = toBil(tc.periodo, lang);
  tc.criteri = toBil(tc.criteri, lang);
  r.tempiConservazione = tc;

  const ms = { ...(r.misureSicurezza || {}) };
  ms.tecniche = toBilArray(ms.tecniche, lang);
  ms.organizzative = toBilArray(ms.organizzative, lang);
  ms.rinvioDocumentale = toBil(ms.rinvioDocumentale, lang);
  r.misureSicurezza = ms;

  const pda = { ...(r.processiDecisionaliAutomatizzati || {}) };
  pda.presenti = !!pda.presenti;
  pda.descrizione = toBil(pda.descrizione, lang);
  pda.logica = toBil(pda.logica, lang);
  pda.conseguenze = toBil(pda.conseguenze, lang);
  pda.dirittiInteressato = toBil(pda.dirittiInteressato, lang);
  r.processiDecisionaliAutomatizzati = pda;

  const pm = { ...(r.profilazioneMarketing || {}) };
  pm.presente = !!pm.presente;
  pm.descrizione = toBil(pm.descrizione, lang);
  pm.logica = toBil(pm.logica, lang);
  pm.baseGiuridicaSpecifica = toBil(pm.baseGiuridicaSpecifica, lang);
  r.profilazioneMarketing = pm;

  const vi = { ...(r.valutazioneDiImpatto || {}) };
  vi.effettuata = !!vi.effettuata;
  vi.riferimentoDocumento = toBil(vi.riferimentoDocumento, lang);
  r.valutazioneDiImpatto = vi;

  r.note = toBil(r.note, lang);
  r.schemaVersion = SCHEMA_VERSION;
  return r;
}
function migrateSettingsV1toV2(s, lang) {
  const out = { ...(s || {}) };
  out.uiLanguage = (lang === 'en') ? 'en' : 'it';
  out.registro = { lingue: [out.uiLanguage], linguaPrincipale: out.uiLanguage };
  delete out.lingua;
  out.titolare = { ...(out.titolare || {}) };
  if (typeof out.titolare.sitoWeb !== 'string') out.titolare.sitoWeb = '';
  out.schemaVersion = SCHEMA_VERSION;
  return out;
}

db.version(2).stores({
  settings:            '&id, tenantId',
  processingActivities:'&id, tenantId, tipoRegistro, codiceUtente, [tenantId+tipoRegistro]',
  auditLog:            '&id, tenantId, timestamp, targetType, targetId'
}).upgrade(async (tx) => {
  let lang = 'it';
  const settingsTable = tx.table('settings');
  const existingSettings = await settingsTable.get('default');
  if (existingSettings && (existingSettings.lingua === 'en' || existingSettings.lingua === 'it')) {
    lang = existingSettings.lingua;
  }
  if (existingSettings) {
    await settingsTable.put(migrateSettingsV1toV2(existingSettings, lang));
  }
  const paTable = tx.table('processingActivities');
  await paTable.toCollection().modify((rec) => {
    const migrated = migrateProcessingActivityV1toV2(rec, lang);
    for (const k of Object.keys(rec)) { if (!(k in migrated)) delete rec[k]; }
    Object.assign(rec, migrated);
  });
});

// ============================================================================
// UUID
// ============================================================================
function newUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  throw new Error('crypto.randomUUID() is not available in this browser.');
}

// ============================================================================
// AUDIT LOG (internal)
// ============================================================================
async function logAudit({ azione, targetType, targetId, summary }) {
  const entry = createAuditEntry({ id: newUUID(), azione, targetType, targetId, summary });
  await db.auditLog.add(entry);
  return entry;
}

// ============================================================================
// SETTINGS API
// ============================================================================
export async function getSettings() {
  let settings = await db.settings.get('default');
  if (!settings) {
    settings = createDefaultSettings();
    await db.settings.add(settings);
    await logAudit({
      azione: AUDIT_AZIONE.CREATED, targetType: AUDIT_TARGET.SETTINGS,
      targetId: 'default', summary: 'Initialized default settings on first run'
    });
  }
  return settings;
}
export async function updateSettings(patch) {
  const current = await getSettings();
  const updated = {
    ...current, ...patch,
    id: 'default', tenantId: DEFAULT_TENANT_ID, schemaVersion: SCHEMA_VERSION,
    metadata: { ...current.metadata, updatedAt: new Date().toISOString() }
  };
  await db.settings.put(updated);
  await logAudit({
    azione: AUDIT_AZIONE.UPDATED, targetType: AUDIT_TARGET.SETTINGS,
    targetId: 'default', summary: 'Settings updated'
  });
  return updated;
}

// ============================================================================
// PROCESSING ACTIVITIES API
// ============================================================================
export async function createProcessingActivity(initial = {}) {
  const record = createDefaultProcessingActivity({ id: newUUID() });
  Object.assign(record, initial, {
    id: record.id, tenantId: DEFAULT_TENANT_ID, schemaVersion: SCHEMA_VERSION, metadata: record.metadata
  });
  await db.processingActivities.add(record);
  await logAudit({
    azione: AUDIT_AZIONE.CREATED, targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: record.id, summary: `Created processing activity "${displayName(record.nome, record.id)}"`
  });
  return record;
}
export async function getProcessingActivity(id) {
  return await db.processingActivities.get(id);
}
export async function listProcessingActivities() {
  return await db.processingActivities
    .where('[tenantId+tipoRegistro]')
    .equals([DEFAULT_TENANT_ID, 'titolare'])
    .toArray();
}
export async function updateProcessingActivity(id, patch) {
  const current = await db.processingActivities.get(id);
  if (!current) throw new Error(`Processing activity ${id} not found`);
  const updated = {
    ...current, ...patch,
    id: current.id, tenantId: DEFAULT_TENANT_ID, schemaVersion: SCHEMA_VERSION,
    metadata: {
      ...current.metadata, updatedAt: new Date().toISOString(),
      version: (current.metadata?.version || 1) + 1
    }
  };
  await db.processingActivities.put(updated);
  await logAudit({
    azione: AUDIT_AZIONE.UPDATED, targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: id, summary: `Updated processing activity "${displayName(updated.nome, id)}"`
  });
  return updated;
}
export async function deleteProcessingActivity(id) {
  const current = await db.processingActivities.get(id);
  if (!current) return;
  await db.processingActivities.delete(id);
  await logAudit({
    azione: AUDIT_AZIONE.DELETED, targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: id, summary: `Deleted processing activity "${displayName(current.nome, id)}"`
  });
}

// ============================================================================
// AUDIT LOG API
// ============================================================================
export async function listAuditLog(limit = 100) {
  const all = await db.auditLog.where('tenantId').equals(DEFAULT_TENANT_ID).toArray();
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}

// ============================================================================
// TEMPLATE LIBRARY
// ============================================================================
function displayName(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.it || value.en || fallback;
  return String(value);
}

let _templateCatalogCache = null;

function deepMerge(target, source) {
  const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = out[key];
    if (isPlainObject(sVal) && isPlainObject(tVal)) {
      out[key] = deepMerge(tVal, sVal);
    } else {
      out[key] = sVal;
    }
  }
  return out;
}

export async function listAvailableTemplates() {
  if (_templateCatalogCache) return _templateCatalogCache;
  let res;
  try {
    res = await fetch('./data/templates.json', { cache: 'no-cache' });
  } catch (err) {
    throw new Error('Unable to load the template catalog (network/fetch error): ' + err.message);
  }
  if (!res.ok) {
    throw new Error(`Unable to load the template catalog: HTTP ${res.status} ${res.statusText}`);
  }
  let catalog;
  try {
    catalog = await res.json();
  } catch (err) {
    throw new Error('The template catalog is not valid JSON: ' + err.message);
  }
  if (!catalog || !Array.isArray(catalog.templates)) {
    throw new Error('The template catalog is malformed: missing "templates" array.');
  }
  _templateCatalogCache = catalog;
  return catalog;
}

// Bilingual factory: deep-merge the (bilingual) preset onto the default,
// then defensively normalize the canonical bilingual shapes. No flattening.
export async function createProcessingActivityFromTemplate(templateId) {
  const catalog = await listAvailableTemplates();
  const template = catalog.templates.find((t) => t.templateId === templateId);
  if (!template) {
    throw new Error(`Template not found: "${templateId}".`);
  }
  const base = createDefaultProcessingActivity({ id: newUUID() });
  const merged = deepMerge(base, template.preset || {});
  normalizeBilingualShapes(merged);

  merged.sourceTemplateId = template.templateId;
  merged.sourceTemplateVersion = typeof catalog.version === 'number' ? catalog.version : null;
  merged.sourceTemplateLanguage = '';
  merged.id = base.id;
  merged.tenantId = DEFAULT_TENANT_ID;
  merged.schemaVersion = SCHEMA_VERSION;
  merged.metadata = base.metadata;

  await db.processingActivities.add(merged);
  await logAudit({
    azione: AUDIT_AZIONE.CREATED, targetType: AUDIT_TARGET.PROCESSING_ACTIVITY,
    targetId: merged.id,
    summary: `Created processing activity "${displayName(merged.nome, merged.id)}" from template "${template.templateId}"`
  });
  return merged;
}

// ----------------------------------------------------------------------------
// Defensive bilingual normalization (post-merge).
// ----------------------------------------------------------------------------
function _isBil(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    && ('it' in v) && ('en' in v)
    && Object.keys(v).every((k) => k === 'it' || k === 'en');
}
function bil(v) {
  if (_isBil(v)) return { it: v.it || '', en: v.en || '' };
  const s = (typeof v === 'string') ? v : '';
  return { it: s, en: '' };
}
function bilArr(v) {
  if (Array.isArray(v)) return v.map((x) => bil(x));
  if (v === undefined || v === null || v === '') return [];
  return [bil(v)];
}
function normalizeBilingualShapes(r) {
  r.nome = bil(r.nome);
  r.descrizione = bil(r.descrizione);
  r.finalita = bilArr(r.finalita);

  const bg = r.baseGiuridica || (r.baseGiuridica = {});
  bg.art6 = Array.isArray(bg.art6) ? bg.art6 : [];
  bg.art9 = Array.isArray(bg.art9) ? bg.art9 : [];
  bg.dettagliArt6 = bil(bg.dettagliArt6);
  bg.dettagliArt9 = bil(bg.dettagliArt9);
  const li = bg.legittimoInteresseDettagli || (bg.legittimoInteresseDettagli = {});
  li.descrizione = bil(li.descrizione);
  li.garanzieAdottate = bil(li.garanzieAdottate);
  li.riferimentoBilanciamento = bil(li.riferimentoBilanciamento);
  li.bilanciamentoEffettuato = !!li.bilanciamentoEffettuato;
  li.bilanciamentoRichiesto = (li.bilanciamentoRichiesto !== undefined) ? !!li.bilanciamentoRichiesto : true;

  const cp = r.datiCondannePenaliReati || (r.datiCondannePenaliReati = {});
  cp.presenti = !!cp.presenti;
  cp.normativaAutorizzativa = bil(cp.normativaAutorizzativa);

  r.categorieInteressati = bilArr(r.categorieInteressati);
  r.categorieDati = bilArr(r.categorieDati);
  r.fonteDeiDatiDettagli = bil(r.fonteDeiDatiDettagli);

  r.categorieDestinatari = bilArr(r.categorieDestinatari);
  if (Array.isArray(r.responsabiliEsterni)) {
    r.responsabiliEsterni = r.responsabiliEsterni.map((re) => {
      const x = re || {};
      x.denominazione = bil(x.denominazione);
      x.sede = bil(x.sede);
      x.finalita = bil(x.finalita);
      x.riferimentoContratto = bil(x.riferimentoContratto);
      x.notaRuoloPrivacy = bil(x.notaRuoloPrivacy);
      x.accordoArt28Presente = !!x.accordoArt28Presente;
      return x;
    });
  } else {
    r.responsabiliEsterni = [];
  }

  if (Array.isArray(r.trasferimentiExtraUE)) {
    r.trasferimentiExtraUE = r.trasferimentiExtraUE.map((tr) => {
      const x = tr || {};
      x.paese = bil(x.paese);
      x.riferimentoDocumentazione = bil(x.riferimentoDocumentazione);
      return x;
    });
  } else {
    r.trasferimentiExtraUE = [];
  }

  const tc = r.tempiConservazione || (r.tempiConservazione = {});
  tc.periodo = bil(tc.periodo);
  tc.criteri = bil(tc.criteri);

  const ms = r.misureSicurezza || (r.misureSicurezza = {});
  ms.tecniche = bilArr(ms.tecniche);
  ms.organizzative = bilArr(ms.organizzative);
  ms.rinvioDocumentale = bil(ms.rinvioDocumentale);

  const pda = r.processiDecisionaliAutomatizzati || (r.processiDecisionaliAutomatizzati = {});
  pda.presenti = !!pda.presenti;
  pda.descrizione = bil(pda.descrizione);
  pda.logica = bil(pda.logica);
  pda.conseguenze = bil(pda.conseguenze);
  pda.dirittiInteressato = bil(pda.dirittiInteressato);

  const pm = r.profilazioneMarketing || (r.profilazioneMarketing = {});
  pm.presente = !!pm.presente;
  pm.descrizione = bil(pm.descrizione);
  pm.logica = bil(pm.logica);
  pm.baseGiuridicaSpecifica = bil(pm.baseGiuridicaSpecifica);

  const vi = r.valutazioneDiImpatto || (r.valutazioneDiImpatto = {});
  vi.effettuata = !!vi.effettuata;
  vi.riferimentoDocumento = bil(vi.riferimentoDocumento);

  r.note = bil(r.note);
  return r;
}

// ============================================================================
// EXPORTS
// ============================================================================
export { db };

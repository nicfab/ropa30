/*
 * ropa30 — app.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Alpine.js component for ropa30 (CSP-safe build, @alpinejs/csp).
 * Settings schema v2: uiLanguage (display, persisted) +
 * registro {lingue, linguaPrincipale} (enabled register languages + primary).
 * UI language and register languages are INDEPENDENT (architecture α).
 */

import {
  getSettings,
  updateSettings,
  listProcessingActivities,
  getProcessingActivity,
  updateProcessingActivity,
  normalizeBilingualShapes,
  listAvailableTemplates,
  createProcessingActivityFromTemplate,
  exportAllData,
  importAllData,
  validateBackupEnvelope
} from './db.js';

import localeIt from '../locales/it.js';
import localeEn from '../locales/en.js';
import { buildDettaglio } from './detail.js';
import { scaricaBackup } from './exporters/backup.js';
import { leggiFileBackup } from './importers/restore.js';
import { buildModelloRegistro } from './exporters/registro-common.js';
import { esportaRegistroXlsx } from './exporters/xlsx.js';
import { esportaRegistroOds } from './exporters/ods.js';
import { buildEditModel, applyEditModel, nuovaVoceLista, nuovaRigaGruppo } from './editor.js';

function ropa30App() {
  const translations    = { it: localeIt.ui,              en: localeEn.ui };
  const CATEGORIA_LABEL  = { it: localeIt.enums.categoria, en: localeEn.enums.categoria };
  const ART6_LABEL       = { it: localeIt.enums.art6,      en: localeEn.enums.art6 };
  const LOCALI = { it: localeIt, en: localeEn };

  return {
    // ---- State ----
    lang: 'it',
    view: '',
    saving: false,
    erroreSalvataggio: false,
    settingsCreatedAt: '',

    // Onboarding form
    denominazione: '', formaGiuridica: '', codiceFiscale: '', partitaIVA: '', telefono: '',
    via: '', civico: '', cap: '', citta: '', provincia: '', paese: 'IT',
    email: '', pec: '', sitoWeb: '',
    dpoNominato: false, dpoNome: '', dpoEmail: '', dpoPec: '',

    // Register languages (M5): enabled set via checkboxes + primary.
    regIt: true,
    regEn: false,
    regPrincipale: 'it',

    // List
    _rawTrattamenti: [],
    trattamenti: [],
    // ---- Restore (Fase 3) ----
    restoreEnvelope: null,        // parsed envelope awaiting user confirmation
    restoreSummary: null,         // { counts, exportedAt } shown in the confirm dialog
    isRestoreConfirmOpen: false,  // confirmation dialog visibility
    restoreInCorso: false,        // guard against double submit
    restoreFaraBackup: false,     // true if a safety backup will be downloaded before restore
    restoreMessage: '',           // localized outcome message
    restoreError: false,          // styles the outcome message as error
    // ---- Export registro (Fase 4) ----
    isExportMenuOpen: false,      // export dialog visibility
    exportMessage: '',            // localized export outcome
    exportError: false,
    // ---- PWA ----
    storagePersistente: false,    // navigator.storage persisted state (informational)
    trattamentiFiltrati: [],
    queryRicerca: '',
    nuovoTrattamentoId: null,

    // Detail (read-only)
    trattamentoCorrente: null,
    trattamentoVm: null,
    trattamentoTitolo: '',
    // Editor (Step C)
    editId: null,
    editRecord: null,        // working copy (deep clone via JSON) — protected until save
    editModel: { sezioni: [] }, // edit-model bound by the template (never null: avoids x-for teardown race)
    editTitolo: '',
    editLingue: ['it'],      // from settings.registro.lingue (1 or 2 columns)
    editDirty: false,
    editSalvando: false,
    editErroreSalva: false,
    editNomeMancante: false,
    chiediConfermaAnnulla: false,
    // ---- Titolare onboarding/modifica (dirty-guard) ----
    isModificaTitolare: false,    // true when entered via 'Modifica dati titolare'
    titolareDirty: false,         // a controller field has been changed
    chiediConfermaAnnullaTitolare: false,
    _snapTitolare: null,          // snapshot for dirty-check and restore-on-cancel

    // Catalog
    _rawTemplates: [],
    _catByTemplateId: {},
    templates: [],
    templatesFiltrati: [],
    queryCatalogo: '',
    _catalogoCaricato: false,
    catalogoAperto: false,
    creazioneInCorso: false,
    erroreCreazione: false,
    // Backup (export JSON)
    backupInCorso: false,
    erroreBackup: false,

    // Load controller + DPO + register languages from settings into state.
    // Used by init() and after a restore (so the UI reflects imported settings).
    async _caricaTitolareDaSettings() {
      const settings = await getSettings();
      const lng = (settings.uiLanguage === 'en' || settings.uiLanguage === 'it') ? settings.uiLanguage : 'it';
      this.lang = lng;
      document.documentElement.setAttribute('lang', lng);
      this.settingsCreatedAt = (settings.metadata && settings.metadata.createdAt) || '';
      const t = settings.titolare || {};
      const ind = t.indirizzo || {};
      this.denominazione = t.denominazione || '';
      this.formaGiuridica = t.formaGiuridica || '';
      this.codiceFiscale = t.codiceFiscale || '';
      this.partitaIVA = t.partitaIVA || '';
      this.telefono = t.telefono || '';
      this.via = ind.via || ''; this.civico = ind.civico || ''; this.cap = ind.cap || '';
      this.citta = ind.citta || ''; this.provincia = ind.provincia || ''; this.paese = ind.paese || 'IT';
      this.email = t.email || ''; this.pec = t.pec || ''; this.sitoWeb = t.sitoWeb || '';
      const d = settings.dpo || {};
      this.dpoNominato = !!d.nominato;
      this.dpoNome = d.nome || ''; this.dpoEmail = d.email || ''; this.dpoPec = d.pec || '';
      const reg = settings.registro || { lingue: ['it'], linguaPrincipale: 'it' };
      const lingue = Array.isArray(reg.lingue) && reg.lingue.length ? reg.lingue : ['it'];
      this.regIt = lingue.indexOf('it') !== -1;
      this.regEn = lingue.indexOf('en') !== -1;
      if (!this.regIt && !this.regEn) this.regIt = true;
      const princ = (reg.linguaPrincipale === 'en' || reg.linguaPrincipale === 'it') ? reg.linguaPrincipale : 'it';
      this.regPrincipale = (this[princ === 'en' ? 'regEn' : 'regIt']) ? princ : (this.regIt ? 'it' : 'en');
    },
    async init() {
      try {
        await this._caricaTitolareDaSettings();

        await this._assicuraCatalogo();
        await this.caricaTrattamenti();

        // Storage persistence: ask the browser not to evict our IndexedDB data.
        // Best-effort, non-blocking, no user-facing prompt.
        try {
          if (navigator.storage && navigator.storage.persist) {
            const gia = await navigator.storage.persisted();
            this.storagePersistente = gia || await navigator.storage.persist();
          }
        } catch (e) {
          console.warn('[ropa30] storage.persist non disponibile:', e);
        }

        // First run (no controller yet) -> welcome screen (import vs start fresh);
        // otherwise straight to the list.
        this.view = (this.denominazione.trim() === '') ? 'welcome' : 'lista';

        this.$watch('lang', () => { this._mappaTrattamenti(); this._mappaTemplates(); if (this.view === 'dettaglio' && this.trattamentoCorrente) { this.trattamentoVm = this._costruisciVm(this.trattamentoCorrente); } });
        this.$watch('queryRicerca', () => { this._filtra(); });
        this.$watch('queryCatalogo', () => { this._filtraCatalogo(); });
      } catch (err) {
        console.error('[ropa30] init() error:', err);
        this.view = 'onboarding';
      }
    },

    // ---- Translations ----
    get L() { return translations[this.lang]; },
    get appTitle()          { return translations[this.lang].appTitle; },
    get appDescription()    { return translations[this.lang].appDescription; },
    get langSwitcherLabel() { return translations[this.lang].langSwitcherLabel; },
    get skipToContent()     { return translations[this.lang].skipToContent; },
    get brandTagline()      { return translations[this.lang].brandTagline; },
    get footerLicense()     { return translations[this.lang].footerLicense; },
    get footerAuthor()      { return translations[this.lang].footerAuthor; },

    // ---- View flags ----
    get isViewWelcome() { return this.view === 'welcome'; },
    get isViewOnboarding() { return this.view === 'onboarding'; },
    get isViewLista()      { return this.view === 'lista'; },
    get isViewDettaglio() { return this.view === 'dettaglio'; },
    get isViewEditor()    { return this.view === 'editor'; },
    get restoreCountPA() { return this.restoreSummary ? String(this.restoreSummary.counts.processingActivities) : ''; },
    // Print model for the whole register (rich, document-oriented).
    get registroStampa() {
      const loc = LOCALI[this.lang] || LOCALI.it;
      const deps = { detail: loc.detail, enums: loc.enums };
      const records = Array.isArray(this._rawTrattamenti) ? this._rawTrattamenti : [];
      const trattamenti = records.map((rec) => {
        const dett = buildDettaglio(rec, this.lang, deps);
        const t = this._locConFallback(rec.nome);
        const sezioni = (dett.sezioni || []).map((sez) => ({
          titolo: sez.titolo,
          campi: (sez.campi || []).map((c) => ({ ...c, isSemplice: (c.tipo !== 'lista' && c.tipo !== 'gruppi'), isLista: (c.tipo === 'lista'), isGruppi: (c.tipo === 'gruppi') }))
        }));
        return { titolo: (t && t.testo) || this.L.sennaNome, sezioni };
      });
      return {
        titolare: this.denominazione || '',
        generatoIl: new Date().toLocaleString(this.lang === 'en' ? 'en-GB' : 'it-IT'),
        lingua: this.lang,
        conteggio: trattamenti.length,
        trattamenti
      };
    },
    stampaRegistro() {
      setTimeout(function () { window.print(); }, 0);
    },
    apriExportMenu() {
      this.exportMessage = '';
      this.exportError = false;
      this.isExportMenuOpen = true;
    },
    chiudiExportMenu() {
      this.isExportMenuOpen = false;
    },
    _modelloRegistro() {
      const loc = LOCALI[this.lang] || LOCALI.it;
      const deps = { detail: loc.detail, enums: loc.enums };
      const records = Array.isArray(this._rawTrattamenti) ? this._rawTrattamenti : [];
      return buildModelloRegistro(records, this.lang, deps, { denominazione: this.denominazione || '' });
    },
    esportaXLSX() {
      this.exportError = false;
      try {
        const model = this._modelloRegistro();
        const labels = { titolo: this.L.printTitoloRegistro, generatoIl: this.L.printGeneratoIl };
        esportaRegistroXlsx(model, labels);
        this.isExportMenuOpen = false;
        this.exportMessage = this.L.exportFatto || 'Export completato';
      } catch (err) {
        console.error('[ropa30] esportaXLSX() error:', err);
        this.exportError = true;
        this.exportMessage = this.L.exportErrore || 'Errore durante l\u2019export';
      }
    },
    esportaODS() {
      this.exportError = false;
      try {
        const model = this._modelloRegistro();
        const labels = { titolo: this.L.printTitoloRegistro, generatoIl: this.L.printGeneratoIl };
        esportaRegistroOds(model, labels);
        this.isExportMenuOpen = false;
        this.exportMessage = this.L.exportFatto || 'Export completato';
      } catch (err) {
        console.error('[ropa30] esportaODS() error:', err);
        this.exportError = true;
        this.exportMessage = this.L.exportErrore || 'Errore durante l\u2019export';
      }
    },
    esportaPDF() {
      // Close the dialog, then trigger the browser print dialog on the next tick
      // so the dialog overlay is gone and @media print sees only #print-area.
      this.isExportMenuOpen = false;
      const self = this;
      setTimeout(function () { window.print(); }, 50);
    },

    get restoreDataExport() { return this.restoreSummary ? (this.restoreSummary.exportedAt || '—') : ''; },
    get exportMsgClass() { return this.exportError ? 'mt-2 text-sm text-danger-600' : 'mt-2 text-sm text-accent-600'; },
    get restoreMsgClass() { return this.restoreError ? 'mt-2 text-sm text-danger-600' : 'mt-2 text-sm text-accent-600'; },
    get wrapperClass() { return this.view === 'editor' ? 'max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14' : 'max-w-3xl mx-auto px-4 py-10 sm:py-14'; },
    get editMostraEn()    { return this.editLingue.indexOf('en') !== -1; },
    get editMostraIt()    { return this.editLingue.indexOf('it') !== -1; },
    get editSalvaDisabilitato() { return this.editNomeMancante || this.editSalvando; },
    get badgeManca() { return this.lang === 'en' ? this.L.mancaEN : this.L.mancaIT; },
    get haTrattamenti()    { return this.trattamenti.length > 0; },
    get nonHaTrattamenti() { return this.trattamenti.length === 0; },
    get haRisultati()      { return this.trattamentiFiltrati.length > 0; },
    get nessunRisultato()  { return this.trattamenti.length > 0 && this.trattamentiFiltrati.length === 0; },
    get contatoreTesto()   {
      const n = this.trattamentiFiltrati.length;
      return n + ' ' + (n === 1 ? this.L.contatoreUno : this.L.contatoreMolti);
    },
    get haRisultatiCatalogo()  { return this.templatesFiltrati.length > 0; },
    get nessunRisultatoCatalogo() { return this.templatesFiltrati.length === 0; },

    get isItalianSelected() { return this.lang === 'it'; },
    get isEnglishSelected() { return this.lang === 'en'; },

    // ---- Register language flags ----
    get nessunaLinguaRegistro() { return !this.regIt && !this.regEn; },
    get mostraPrincipaleIt() { return this.regIt; },
    get mostraPrincipaleEn() { return this.regEn; },

    // ---- Onboarding validation ----
    get nonSalvabile() {
      // Art.30(1)(a): the controller must be identified and locatable. We require
      // the name plus the registered seat (city + country). Email/PEC/phone stay
      // optional (a phone number does not identify a controller; a seat does).
      const hasDen = this.denominazione.trim().length > 0;
      const hasSede = this.citta.trim().length > 0 && this.paese.trim().length > 0;
      const hasLingua = this.regIt || this.regEn;
      return !(hasDen && hasSede && hasLingua);
    },
    get salvaDisabilitato() { return this.nonSalvabile || this.saving; },
    get dataCreazioneVisuale() {
      if (!this.settingsCreatedAt) return '\u2014';
      try {
        const dt = new Date(this.settingsCreatedAt);
        if (isNaN(dt.getTime())) return this.settingsCreatedAt;
        const locale = this.lang === 'en' ? 'en-GB' : 'it-IT';
        return dt.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) { return this.settingsCreatedAt; }
    },

    // Keep the primary language valid w.r.t. enabled languages (invariant).
    validaLingueRegistro() {
      if (!this.regIt && !this.regEn) {
        // Don't allow zero languages: the just-unchecked one cannot be known
        // here without args, so we restore the primary's language as enabled.
        if (this.regPrincipale === 'en') this.regEn = true; else this.regIt = true;
        return;
      }
      if (this.regPrincipale === 'it' && !this.regIt) this.regPrincipale = 'en';
      if (this.regPrincipale === 'en' && !this.regEn) this.regPrincipale = 'it';
    },

    // ---- Localization helpers ----
    _locStrict(obj) {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'object') return obj[this.lang] || '';
      return String(obj);
    },
    _locConFallback(obj) {
      if (!obj) return { testo: '', mancante: false, fallback: false };
      if (typeof obj === 'string') return { testo: obj, mancante: false, fallback: false };
      const attiva = obj[this.lang] || '';
      if (attiva) return { testo: attiva, mancante: false, fallback: false };
      const altra = (this.lang === 'it') ? (obj.en || '') : (obj.it || '');
      if (altra) return { testo: altra, mancante: true, fallback: true };
      return { testo: '', mancante: false, fallback: false };
    },
    _tronca(s, n) {
      if (!s) return '';
      if (s.length <= n) return s;
      return s.slice(0, n).replace(/\s+\S*$/, '') + '\u2026';
    },
    _loc(obj) {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      return obj[this.lang] || obj.it || obj.en || '';
    },

    // ---- Catalog ----
    async _assicuraCatalogo() {
      if (this._catalogoCaricato) return;
      try {
        const catalog = await listAvailableTemplates();
        this._rawTemplates = Array.isArray(catalog.templates) ? catalog.templates : [];
        const map = {};
        for (const t of this._rawTemplates) map[t.templateId] = t.categoria || '';
        this._catByTemplateId = map;
        this._catalogoCaricato = true;
        this._mappaTemplates();
      } catch (err) {
        console.error('[ropa30] catalog load error:', err);
      }
    },
    async apriCatalogo() {
      this.erroreCreazione = false;
      this.queryCatalogo = '';
      await this._assicuraCatalogo();
      this._filtraCatalogo();
      this.catalogoAperto = true;
    },
    chiudiCatalogo() { this.catalogoAperto = false; },
    _mappaTemplates() {
      const catmap = CATEGORIA_LABEL[this.lang] || CATEGORIA_LABEL.it;
      this.templates = (this._rawTemplates || []).map((t) => {
        const nomeLoc = this._loc(t.nome);
        const descrizioneLoc = this._loc(t.descrizioneTemplate);
        const categoriaLabel = catmap[t.categoria] || t.categoria || '';
        const blob = (nomeLoc + ' ' + descrizioneLoc + ' ' + categoriaLabel).toLowerCase();
        return {
          id: t.templateId, categoriaLabel, nomeLoc,
          descrizioneLoc: this._tronca(descrizioneLoc, 160), _blob: blob
        };
      });
      this._filtraCatalogo();
    },
    _filtraCatalogo() {
      const q = (this.queryCatalogo || '').trim().toLowerCase();
      if (!q) { this.templatesFiltrati = this.templates; return; }
      this.templatesFiltrati = this.templates.filter((t) => t._blob.indexOf(q) !== -1);
    },
    pulisciCatalogo() { this.queryCatalogo = ''; },

    // ---- List ----
    async caricaTrattamenti(highlightId = null) {
      this.nuovoTrattamentoId = highlightId;
      this._rawTrattamenti = await listProcessingActivities();
      this._mappaTrattamenti();
    },
    _mappaTrattamenti() {
      const records = [...this._rawTrattamenti].sort((a, b) => {
        const ca = (a.metadata && a.metadata.createdAt) || '';
        const cb = (b.metadata && b.metadata.createdAt) || '';
        return cb.localeCompare(ca);
      });
      const art6map = ART6_LABEL[this.lang] || ART6_LABEL.it;
      const catmap = CATEGORIA_LABEL[this.lang] || CATEGORIA_LABEL.it;
      this.trattamenti = records.map((r) => {
        const tit = this._locConFallback(r.nome);
        const nome = tit.testo || this.L.sennaNome;
        const nomeMancante = tit.mancante;
        const badgeMancante = nomeMancante
          ? (this.lang === 'en' ? this.L.mancaEN : this.L.mancaIT)
          : '';

        const fin = Array.isArray(r.finalita)
          ? r.finalita.map((f) => this._locStrict(f)).filter(Boolean) : [];
        let finalitaSintesi = fin.slice(0, 2).join('; ');
        if (fin.length > 2) finalitaSintesi += '\u2026';
        if (!finalitaSintesi) finalitaSintesi = '\u2014';

        const art6 = (r.baseGiuridica && Array.isArray(r.baseGiuridica.art6)) ? r.baseGiuridica.art6 : [];
        const basi = art6.map((k) => art6map[k] || k);
        const basiSintesi = basi.length ? basi.join(', ') : '\u2014';

        const cat = this._catByTemplateId[r.sourceTemplateId || ''] || '';
        const categoriaLabel = cat ? (catmap[cat] || cat) : '';

        const evidenziato = !!this.nuovoTrattamentoId && r.id === this.nuovoTrattamentoId;
        const blob = (
          (r.nome ? (r.nome.it || '') + ' ' + (r.nome.en || '') : '') + ' ' +
          (Array.isArray(r.finalita) ? r.finalita.map((f) => (f.it || '') + ' ' + (f.en || '')).join(' ') : '') + ' ' +
          basi.join(' ')
        ).toLowerCase();

        return {
          id: r.id, nome, nomeMancante, badgeMancante,
          cssNome: nomeMancante ? 'italic text-brand-400' : '',
          finalitaSintesi, basiSintesi, categoriaLabel,
          mostraCategoria: categoriaLabel.length > 0,
          cssEvidenzia: evidenziato ? 'ring-2 ring-brand-400' : '',
          _blob: blob
        };
      });
      this._filtra();
    },
    _filtra() {
      const q = (this.queryRicerca || '').trim().toLowerCase();
      if (!q) { this.trattamentiFiltrati = this.trattamenti; return; }
      this.trattamentiFiltrati = this.trattamenti.filter((t) => t._blob.indexOf(q) !== -1);
    },
    pulisciRicerca() { this.queryRicerca = ''; },

    // ---- Create from template ----
    async creaDaTemplate(event) {
      if (this.creazioneInCorso) return;
      const id = (event && event.currentTarget && event.currentTarget.dataset)
        ? event.currentTarget.dataset.templateId : '';
      if (!id) return;
      this.creazioneInCorso = true;
      this.erroreCreazione = false;
      try {
        const nuovo = await createProcessingActivityFromTemplate(id);
        this.catalogoAperto = false;
        this.queryRicerca = '';
        await this.caricaTrattamenti(nuovo.id);
        this.view = 'lista';
        const self = this;
        setTimeout(function () { self.caricaTrattamenti(null); }, 2600);
      } catch (err) {
        console.error('[ropa30] creaDaTemplate() error:', err);
        this.erroreCreazione = true;
      } finally {
        this.creazioneInCorso = false;
      }
    },

    // ---- Backup (export JSON) ----
    async esportaBackup() {
      if (this.backupInCorso) return;
      this.backupInCorso = true;
      this.erroreBackup = false;
      try {
        const envelope = await exportAllData();
        scaricaBackup(envelope);
      } catch (err) {
        console.error('[ropa30] esportaBackup() error:', err);
        this.erroreBackup = true;
      } finally {
        this.backupInCorso = false;
      }
    },

    // ---- Restore from backup file (Fase 3) ----
    // Opens the hidden <input type="file"> programmatically.
    apriSelezioneFile() {
      this.restoreMessage = '';
      this.restoreError = false;
      const input = document.getElementById('restore-file-input');
      if (input) { input.value = ''; input.click(); }
    },

    // Reads + parses + validates the chosen file. On success, stores the
    // envelope and opens the confirmation dialog. NEVER touches the DB here.
    async fileSelezionato(event) {
      const file = event && event.target && event.target.files && event.target.files[0];
      if (!file) return;
      this.restoreMessage = '';
      this.restoreError = false;
      try {
        const envelope = await leggiFileBackup(file);
        const { ok, errors, summary } = validateBackupEnvelope(envelope);
        if (!ok) {
          this.restoreError = true;
          this.restoreMessage = (this.L.restoreErroreFile || 'File non valido') + ' (' + errors.join(', ') + ')';
          return;
        }
        this.restoreEnvelope = envelope;
        this.restoreSummary = summary;
        // A preventive backup is made only if there is existing data worth
        // protecting (controller name set, or processing activities present).
        // From a cold start (welcome / empty DB) there is nothing to back up.
        this.restoreFaraBackup =
          this.denominazione.trim() !== '' ||
          (Array.isArray(this._rawTrattamenti) && this._rawTrattamenti.length > 0);
        this.isRestoreConfirmOpen = true;
      } catch (err) {
        console.error('[ropa30] fileSelezionato() error:', err);
        this.restoreError = true;
        const code = (err && err.message) || 'READ_ERROR';
        this.restoreMessage = (this.L.restoreErroreFile || 'File non valido') + ' (' + code + ')';
      }
    },

    // Confirmed restore: auto-backup current state, then replace, then reload.
    async confermaRestore() {
      if (this.restoreInCorso || !this.restoreEnvelope) return;
      this.restoreInCorso = true;
      this.restoreError = false;
      this.restoreMessage = '';
      try {
        // 1) Safety net: download a backup of the CURRENT data first,
        // but ONLY if there is existing data (skip on cold start / empty DB).
        if (this.restoreFaraBackup) {
          try {
            const current = await exportAllData();
            scaricaBackup(current);
          } catch (e) {
            console.error('[ropa30] auto-backup before restore failed:', e);
          }
        }
        // 2) Replace the database with the imported envelope.
        // Deep-clone to strip the Alpine Proxy (Dexie cannot structured-clone a Proxy).
        const plainEnvelope = JSON.parse(JSON.stringify(this.restoreEnvelope));
        const result = await importAllData(plainEnvelope, { mode: 'replace' });
        // 3) Reload controller/settings AND the list into state (no manual refresh).
        await this._caricaTitolareDaSettings();
        await this.caricaTrattamenti();
        this.isRestoreConfirmOpen = false;
        this.restoreEnvelope = null;
        this.restoreSummary = null;
        const n = result.counts.processingActivities;
        this.restoreMessage = (this.L.restoreSuccesso || 'Ripristino completato') + ' (' + n + ')';
        this.restoreError = false;
        this.view = 'lista';
      } catch (err) {
        console.error('[ropa30] confermaRestore() error:', err);
        this.isRestoreConfirmOpen = false;
        this.restoreError = true;
        this.restoreMessage = this.L.restoreErroreRipristino || 'Errore durante il ripristino';
      } finally {
        this.restoreInCorso = false;
      }
    },

    annullaRestore() {
      this.isRestoreConfirmOpen = false;
      this.restoreEnvelope = null;
      this.restoreSummary = null;
    },


    // ---- Navigation ----
    // Welcome -> start fresh: open the controller form (first-run, not edit mode).
    welcomeIniziaDaZero() {
      this.erroreSalvataggio = false;
      this.isModificaTitolare = false;
      this.titolareDirty = false;
      this._snapTitolare = null;
      this.view = 'onboarding';
    },
    // Welcome -> import: kick off the existing restore flow (file picker).
    welcomeImportaBackup() {
      this.apriSelezioneFile();
    },
    // Enter the controller form in EDIT mode (from 'Modifica dati titolare').
    vaiAOnboarding() {
      this.erroreSalvataggio = false;
      this.isModificaTitolare = true;
      this._snapTitolare = this._snapshotTitolare();
      this.titolareDirty = false;
      this.chiediConfermaAnnullaTitolare = false;
      this.view = 'onboarding';
    },
    // Capture all controller/DPO/language fields, for dirty-check and restore.
    _snapshotTitolare() {
      return {
        denominazione: this.denominazione, formaGiuridica: this.formaGiuridica,
        codiceFiscale: this.codiceFiscale, partitaIVA: this.partitaIVA, telefono: this.telefono,
        via: this.via, civico: this.civico, cap: this.cap, citta: this.citta,
        provincia: this.provincia, paese: this.paese, email: this.email, pec: this.pec,
        sitoWeb: this.sitoWeb, dpoNominato: this.dpoNominato, dpoNome: this.dpoNome,
        dpoEmail: this.dpoEmail, dpoPec: this.dpoPec,
        regIt: this.regIt, regEn: this.regEn, regPrincipale: this.regPrincipale
      };
    },
    // Restore controller fields from the snapshot (discard edits on cancel).
    _ripristinaTitolare() {
      const sN = this._snapTitolare;
      if (!sN) return;
      for (const k of Object.keys(sN)) { this[k] = sN[k]; }
    },
    // Mark the controller form dirty (bound to field inputs in the view).
    segnaTitolareDirty() { if (this.isModificaTitolare) this.titolareDirty = true; },
    // Cancel controller editing: ask confirmation only if there are unsaved edits.
    annullaModificaTitolare() {
      if (this.titolareDirty) { this.chiediConfermaAnnullaTitolare = true; return; }
      this._uscitaDaTitolare();
    },
    confermaAnnullaTitolare() { this._uscitaDaTitolare(); },
    annullaAnnullaTitolare() { this.chiediConfermaAnnullaTitolare = false; },
    _uscitaDaTitolare() {
      this._ripristinaTitolare();
      this.titolareDirty = false;
      this.isModificaTitolare = false;
      this.chiediConfermaAnnullaTitolare = false;
      this._snapTitolare = null;
      this.view = 'lista';
    },
    vaiAllaLista()   { this.view = 'lista'; },

    // ---- Detail (read-only) ----
    _costruisciVm(record) {
      const loc = LOCALI[this.lang] || localeIt;
      return buildDettaglio(record, this.lang, { detail: loc.detail, enums: loc.enums });
    },
    async apriDettaglio(event) {
      const id = (event && event.currentTarget && event.currentTarget.dataset)
        ? event.currentTarget.dataset.id : '';
      if (!id) return;
      try {
        const record = await getProcessingActivity(id);
        if (!record) { this.view = 'lista'; return; }
        this.trattamentoCorrente = record;
        this.trattamentoTitolo = this._loc(record.nome) || this.L.sennaNome;
        this.trattamentoVm = this._costruisciVm(record);
        this.view = 'dettaglio';
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('[ropa30] apriDettaglio() error:', err);
        this.view = 'lista';
      }
    },
    tornaAllaLista() {
      this.view = 'lista';
      this.trattamentoCorrente = null;
      this.trattamentoVm = null;
      this.trattamentoTitolo = '';
    },

    // ---- Editor (Step C) ----
    _validaNomeEditor() {
      // Required: name non-empty in the register's PRIMARY language.
      const princ = (this.editLingue.indexOf('it') !== -1) ? 'it' : (this.editLingue[0] || 'it');
      let nomeCtl = null;
      const sez0 = this.editModel && this.editModel.sezioni[0];
      if (sez0) nomeCtl = sez0.campi.find((c) => c.chiave === 'nome');
      const val = nomeCtl ? (princ === 'en' ? nomeCtl.valEn : nomeCtl.valIt) : '';
      this.editNomeMancante = !(val && val.trim().length > 0);
    },
    async apriEditor(event) {
      const id = (event && event.currentTarget && event.currentTarget.dataset)
        ? event.currentTarget.dataset.id : (this.trattamentoCorrente ? this.trattamentoCorrente.id : '');
      if (!id) return;
      try {
        const record = await getProcessingActivity(id);
        if (!record) { this.view = 'lista'; return; }
        this.editId = id;
        this.editRecord = JSON.parse(JSON.stringify(record));
        this.editLingue = Array.isArray(this.editRegistroLingue()) ? this.editRegistroLingue() : ['it'];
        const loc = LOCALI[this.lang] || localeIt;
        this.editModel = buildEditModel(this.editRecord, {
          lingue: this.editLingue, detail: loc.detail, enums: loc.enums
        });
        this.editTitolo = this._loc(record.nome) || this.L.sennaNome;
        this.editDirty = false;
        this.editErroreSalva = false;
        this.chiediConfermaAnnulla = false;
        this._validaNomeEditor();
        this.view = 'editor';
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('[ropa30] apriEditor() error:', err);
        this.view = 'lista';
      }
    },
    editRegistroLingue() {
      const out = [];
      if (this.regIt) out.push('it');
      if (this.regEn) out.push('en');
      return out.length ? out : ['it'];
    },
    segnaDirty() {
      this.editDirty = true;
      this._validaNomeEditor();
    },
    async salvaTrattamento() {
      this._validaNomeEditor();
      if (this.editNomeMancante || this.editSalvando) return;
      this.editSalvando = true;
      this.editErroreSalva = false;
      try {
        const work = JSON.parse(JSON.stringify(this.editRecord));
        applyEditModel(work, this.editModel);
        normalizeBilingualShapes(work);
        await updateProcessingActivity(this.editId, work);
        const id = this.editId;
        this._resetEditor();
        await this.caricaTrattamenti();      // keep the list in sync
        await this.apriDettaglioById(id);    // back to the updated detail (C3-D1: a)
      } catch (err) {
        console.error('[ropa30] salvaTrattamento() error:', err);
        this.editErroreSalva = true;
      } finally {
        this.editSalvando = false;
      }
    },
    annullaEditor() {
      if (this.editDirty) { this.chiediConfermaAnnulla = true; return; }
      this._uscitaDaEditor();
    },
    confermaAnnulla() { this._uscitaDaEditor(); },
    annullaAnnulla()  { this.chiediConfermaAnnulla = false; },
    _uscitaDaEditor() {
      const id = this.editId;
      this._resetEditor();
      if (id) { this.apriDettaglioById(id); } else { this.view = 'lista'; }
    },
    _resetEditor() {
      this.editId = null;
      this.editRecord = null;
      this.editModel = { sezioni: [] };
      this.editTitolo = '';
      this.editDirty = false;
      this.editErroreSalva = false;
      this.editNomeMancante = false;
      this.chiediConfermaAnnulla = false;
    },
    async apriDettaglioById(id) {
      try {
        const record = await getProcessingActivity(id);
        if (!record) { this.view = 'lista'; return; }
        this.trattamentoCorrente = record;
        this.trattamentoTitolo = this._loc(record.nome) || this.L.sennaNome;
        this.trattamentoVm = this._costruisciVm(record);
        this.view = 'dettaglio';
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('[ropa30] apriDettaglioById() error:', err);
        this.view = 'lista';
      }
    },

    // ---- Editor: array helpers (read coordinates from dataset) ----
    _campoDaEvento(event) {
      const ds = (event && event.currentTarget && event.currentTarget.dataset) ? event.currentTarget.dataset : null;
      if (!ds || !this.editModel) return { campo: null, idx: -1 };
      const si = parseInt(ds.sez, 10);
      const ci = parseInt(ds.campo, 10);
      const idx = (ds.idx !== undefined && ds.idx !== '') ? parseInt(ds.idx, 10) : -1;
      const sez = this.editModel.sezioni[si];
      const campo = sez ? sez.campi[ci] : null;
      return { campo, idx };
    },
    aggiungiVoce(event) {
      const { campo } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.voci)) {
        campo.voci.push(nuovaVoceLista());
        this.segnaDirty();
      }
    },
    rimuoviVoce(event) {
      const { campo, idx } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.voci) && idx >= 0 && idx < campo.voci.length) {
        campo.voci.splice(idx, 1);
        this.segnaDirty();
      }
    },
    aggiungiRiga(event) {
      const { campo } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.righe)) {
        const loc = LOCALI[this.lang] || localeIt;
        campo.righe.push(nuovaRigaGruppo(campo.gruppoTipo, { detail: loc.detail, enums: loc.enums }));
        this.segnaDirty();
      }
    },
    rimuoviRiga(event) {
      const { campo, idx } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.righe) && idx >= 0 && idx < campo.righe.length) {
        campo.righe.splice(idx, 1);
        this.segnaDirty();
      }
    },

    // ---- Editor: accordion (presentation only) ----
    _sezioneDaEvento(event) {
      const ds = (event && event.currentTarget && event.currentTarget.dataset) ? event.currentTarget.dataset : null;
      if (!ds || !this.editModel) return null;
      const si = parseInt(ds.sez, 10);
      return this.editModel.sezioni[si] || null;
    },
    toggleSezione(event) {
      const sez = this._sezioneDaEvento(event);
      if (sez) sez.aperta = !sez.aperta;
    },
    espandiTutto() {
      if (this.editModel) this.editModel.sezioni.forEach((s) => { s.aperta = true; });
    },
    comprimiTutto() {
      if (this.editModel) this.editModel.sezioni.forEach((s) => { s.aperta = false; });
    },
    apriEscrollaSezione(event) {
      const ds = (event && event.currentTarget && event.currentTarget.dataset) ? event.currentTarget.dataset : null;
      if (!ds || !this.editModel) return;
      const si = parseInt(ds.sez, 10);
      const sez = this.editModel.sezioni[si];
      if (!sez) return;
      sez.aperta = true;
      const self = this;
      // Wait a tick so x-show reveals the body before scrolling to it.
      setTimeout(function () {
        const el = document.getElementById('edit-' + sez.id);
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    },

    // UI language switch: change display AND persist uiLanguage (independent
    // from register languages — architecture α).
    async setLang(event) {
      const newLang = event.target.value;
      if (newLang !== 'it' && newLang !== 'en') return;
      this.lang = newLang;
      document.documentElement.setAttribute('lang', newLang);
      try {
        await updateSettings({ uiLanguage: newLang });
      } catch (err) {
        console.error('[ropa30] persist uiLanguage error:', err);
      }
    },

    async salvaOnboarding() {
      if (this.nonSalvabile || this.saving) return;
      this.validaLingueRegistro();
      this.saving = true; this.erroreSalvataggio = false;
      try {
        const current = await getSettings();
        const titolare = {
          ...current.titolare,
          denominazione: this.denominazione.trim(),
          formaGiuridica: this.formaGiuridica.trim(),
          partitaIVA: this.partitaIVA.trim(),
          codiceFiscale: this.codiceFiscale.trim(),
          indirizzo: {
            ...((current.titolare && current.titolare.indirizzo) || {}),
            via: this.via.trim(), civico: this.civico.trim(), cap: this.cap.trim(),
            citta: this.citta.trim(), provincia: this.provincia.trim(),
            paese: this.paese.trim() || 'IT'
          },
          email: this.email.trim(), pec: this.pec.trim(),
          telefono: this.telefono.trim(), sitoWeb: this.sitoWeb.trim()
        };
        const dpo = {
          ...current.dpo,
          nominato: this.dpoNominato,
          nome: this.dpoNominato ? this.dpoNome.trim() : '',
          email: this.dpoNominato ? this.dpoEmail.trim() : '',
          pec: this.dpoNominato ? this.dpoPec.trim() : ''
        };

        const lingue = [];
        if (this.regIt) lingue.push('it');
        if (this.regEn) lingue.push('en');
        if (lingue.length === 0) lingue.push('it');
        let principale = this.regPrincipale;
        if (lingue.indexOf(principale) === -1) principale = lingue[0];

        await updateSettings({
          titolare, dpo,
          registro: { lingue, linguaPrincipale: principale }
        });

        this.isModificaTitolare = false;
        this.titolareDirty = false;
        this._snapTitolare = null;
        this.chiediConfermaAnnullaTitolare = false;
        this.view = 'lista';
      } catch (err) {
        console.error('[ropa30] salvaOnboarding() error:', err);
        this.erroreSalvataggio = true;
      } finally {
        this.saving = false;
      }
    }
  };
}

document.addEventListener('alpine:init', () => {
  window.Alpine.data('ropa30App', ropa30App);
});

// ============================================================================
// DEVELOPMENT: expose db API for console testing.
// TODO(v1.0): remove these globals before public release.
// ============================================================================
import * as ropa30db from './db.js';
window.ropa30 = ropa30db;
console.info(
  '%c[ropa30 dev]%c db API exposed as window.ropa30',
  'color: #1a4d6e; font-weight: bold;',
  'color: inherit;'
);

// ============================================================================
// PWA: register the service worker for offline support.
// ============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(
      (reg) => console.info('[ropa30] service worker registered, scope:', reg.scope),
      (err) => console.warn('[ropa30] service worker registration failed:', err)
    );
  });
}

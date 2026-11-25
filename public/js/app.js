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
  deleteProcessingActivity,
  resetAllData,
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
import { encryptEnvelope, decryptEnvelope, isEncryptedEnvelope, MIN_PASSWORD_LENGTH } from './crypto/backup-crypto.js';
import { buildModelloRegistro } from './exporters/registro-common.js';
import { esportaRegistroXlsx } from './exporters/xlsx.js';
import { esportaRegistroOds } from './exporters/ods.js';
import { buildEditModel, numeraVoci, applyEditModel, nuovaVoceLista, nuovaRigaGruppo, aggiornaVisibilita, trovaPerIdGuida } from './editor.js';

function ropa30App() {
  const translations    = { it: localeIt.ui,              en: localeEn.ui };
  const CATEGORIA_LABEL  = { it: localeIt.enums.categoria, en: localeEn.enums.categoria };
  const SETTORE_LABEL    = { it: localeIt.enums.settore, en: localeEn.enums.settore };
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
    rappPresente: false, rappDenominazione: '', rappContatto: '',
    dpoNominato: false, dpoNome: '', dpoEmail: '', dpoPec: '',
    // Organisation sheet: section-level guidance panels (open/closed).
    guidaOrgAperta: { titolare: false, indirizzo: false, contatti: false, rappresentante: false, dpo: false, registro: false },

    // Register languages (M5): enabled set via checkboxes + primary.
    regIt: true,
    regEn: false,
    regPrincipale: 'it',

    // List
    _rawTrattamenti: [],
    registroAttivo: 'titolare',   // 'titolare' | 'responsabile' — quale registro art.30 e' in vista
    trattamenti: [],
    // ---- Restore (Fase 3) ----
    restoreEnvelope: null,        // parsed envelope awaiting user confirmation
    restoreSummary: null,         // { counts, exportedAt } shown in the confirm dialog
    isRestoreConfirmOpen: false,  // confirmation dialog visibility
    restoreInCorso: false,        // guard against double submit
    restoreFaraBackup: false,     // true if a safety backup will be downloaded before restore
    restoreMessage: '',           // localized outcome message
    restoreError: false,          // styles the outcome message as error
    // ---- Encrypted backup (optional) ----
    isBackupCifratoOpen: false,   // export dialog (password + confirmation)
    bcPassword: '',
    bcConferma: '',
    bcCapito: false,              // "I understand the password cannot be recovered"
    bcInCorso: false,
    bcErrore: '',
    isRestorePasswordOpen: false, // restore dialog asking for the password
    restoreCifrato: null,         // encrypted envelope awaiting the password
    rpPassword: '',
    rpInCorso: false,
    rpErrore: '',
    // ---- Export registro (Fase 4) ----
    isExportMenuOpen: false,      // export dialog visibility
    isAzioniMenuOpen: false,      // azioni dialog visibility
    isEliminaConfirmOpen: false,  // delete-activity confirmation dialog
    isResetConfirmOpen: false,    // reset-all confirmation dialog
    resetInCorso: false,          // reset in progress guard
    eliminaInCorso: false,        // delete in progress guard
    exportMessage: '',            // localized export outcome
    exportError: false,
    // ---- PWA ----
    storagePersistente: false,    // navigator.storage persisted state (informational)
    trattamentiFiltrati: [],
    queryRicerca: '',
    filtroUnita: '',
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
    filtroSettore: '',
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
      const rp = t.rappresentante || {};
      this.rappPresente = !!rp.presente;
      this.rappDenominazione = rp.denominazione || ''; this.rappContatto = rp.contatto || '';
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
        this.$watch('filtroUnita', () => { this._filtra(); });
        this.$watch('queryCatalogo', () => { this._filtraCatalogo(); });
        this.$watch('filtroSettore', () => { this._filtraCatalogo(); });
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
    get _indirizzoFormattato() {
      const viaCivico = [this.via, this.civico].filter(Boolean).join(' ');
      const capCitta = [this.cap, this.citta].filter(Boolean).join(' ');
      const prov = this.provincia ? '(' + this.provincia + ')' : '';
      const riga1 = [viaCivico, [capCitta, prov].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      return [riga1, this.paese].filter(Boolean).join(' \u2014 ');
    },
    get titolareRighe() {
      const L = this.L; const out = [];
      const push = (label, val) => { if (val && String(val).trim()) out.push({ label: label, value: String(val).trim() }); };
      push(L.tdDenominazione, this.denominazione);
      push(L.tdFormaGiuridica, this.formaGiuridica);
      push(L.tdCodiceFiscale, this.codiceFiscale);
      push(L.tdPartitaIVA, this.partitaIVA);
      push(L.tdIndirizzo, this._indirizzoFormattato);
      push(L.tdTelefono, this.telefono);
      push(L.tdEmail, this.email);
      push(L.tdPec, this.pec);
      push(L.tdSitoWeb, this.sitoWeb);
      if (this.rappPresente) {
        push(L.tdRappresentante, this.rappDenominazione);
        push(L.tdRappContatto, this.rappContatto);
      }
      if (this.dpoNominato) {
        push(L.tdDpoNome, this.dpoNome);
        push(L.tdDpoEmail, this.dpoEmail);
        push(L.tdDpoPec, this.dpoPec);
      }
      return out;
    },
    get recordsPerExport() {
      const records = Array.isArray(this._rawTrattamenti) ? this._rawTrattamenti : [];
      const u = this.filtroUnita || '';
      if (!u) return records;
      return records.filter((r) => {
        const lista = Array.isArray(r.unitaOrganizzativa) ? r.unitaOrganizzativa : [];
        return lista.some((x) => this._locConFallback(x && x.unita).testo === u);
      });
    },
    get exportEstratto() {
      const u = this.filtroUnita || '';
      return { estratto: !!u, unita: u };
    },
    get registroStampa() {
      const loc = LOCALI[this.lang] || LOCALI.it;
      const deps = { detail: loc.detail, enums: loc.enums };
      const records = this.recordsPerExport;
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
        titolareRighe: this.titolareRighe,
        estratto: this.exportEstratto,
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

    // ---- Menu Azioni (dialog) ----
    apriAzioniMenu() {
      this.isAzioniMenuOpen = true;
    },
    chiudiAzioniMenu() {
      this.isAzioniMenuOpen = false;
    },
    azioniBackup() {
      this.isAzioniMenuOpen = false;
      this.esportaBackup();
    },
    azioniBackupCifrato() {
      this.isAzioniMenuOpen = false;
      this._azzeraBackupCifrato();
      this.isBackupCifratoOpen = true;
    },
    azioniImporta() {
      this.isAzioniMenuOpen = false;
      this.apriSelezioneFile();
    },
    azioniEsportaRegistro() {
      this.isAzioniMenuOpen = false;
      this.apriExportMenu();
    },
    azioniReset() {
      this.isAzioniMenuOpen = false;
      this.isResetConfirmOpen = true;
    },
    chiudiResetConfirm() {
      this.isResetConfirmOpen = false;
    },
    resetScaricaBackup() {
      this.esportaBackup();
    },
    async confermaReset() {
      if (this.resetInCorso) return;
      this.resetInCorso = true;
      try {
        await resetAllData();
        this.isResetConfirmOpen = false;
        this.registroAttivo = 'titolare';
        window.location.reload();
      } catch (err) {
        console.error('[ropa30] confermaReset() error:', err);
        this.resetInCorso = false;
      }
    },
    azioniModificaTitolare() {
      this.isAzioniMenuOpen = false;
      this.vaiAOnboarding();
    },
    get titoloRegistroExport() {
      const base = this.L.printTitoloRegistro || '';
      if (this.registroAttivo === 'responsabile') return base + (this.L.printSuffissoResponsabile || '');
      return base + (this.L.printSuffissoTitolare || '');
    },
    _exportLabels() {
      return {
        titolo: this.titoloRegistroExport,
        generatoIl: this.L.printGeneratoIl,
        titolareTitolo: (this.registroAttivo === 'responsabile') ? this.L.tdTitoloResponsabile : this.L.tdTitolo,
        estrattoTitolo: this.L.estrattoTitolo,
        estrattoUnita: this.L.estrattoUnita,
        sheetRegistro: (this.registroAttivo === 'responsabile') ? 'Registro responsabile' : 'Registro titolare',
        fileSlug: (this.registroAttivo === 'responsabile') ? 'registro-responsabile' : 'registro-titolare'
      };
    },
    _modelloRegistro() {
      const loc = LOCALI[this.lang] || LOCALI.it;
      const deps = { detail: loc.detail, enums: loc.enums };
      const records = this.recordsPerExport;
      const titolare = {
        denominazione: this.denominazione || '',
        righe: this.titolareRighe,
        estratto: this.exportEstratto
      };
      return buildModelloRegistro(records, this.lang, deps, titolare);
    },
    esportaXLSX() {
      this.exportError = false;
      try {
        const model = this._modelloRegistro();
        const labels = this._exportLabels();
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
        const labels = this._exportLabels();
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
    get emailNonValida() {
      const e = (this.email || '').trim();
      return e.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    },
    // Error messages linked to their fields (WCAG 3.3.1, 4.1.2): the
    // description is present only while the error is shown.
    get emailAriaInvalid() { return this.emailNonValida ? 'true' : 'false'; },
    get emailDescrittaDa() { return this.emailNonValida ? 'f-email-errore' : null; },
    get bcPasswordAriaInvalid() { return this.bcPasswordCorta ? 'true' : 'false'; },
    get bcPasswordDescrittaDa() { return this.bcPasswordCorta ? 'bc-hint bc-errore-corta' : 'bc-hint'; },
    get bcConfermaAriaInvalid() { return this.bcNonCoincide ? 'true' : 'false'; },
    get bcConfermaDescrittaDa() { return this.bcNonCoincide ? 'bc-errore-diversa' : null; },
    get nonSalvabile() {
      // Art. 30(1)(a): name and contact details of the controller. Required set
      // (legal choice of the author): name, registered seat (city + country) and
      // a valid email address. PEC, phone and postal address stay optional.
      const hasDen = this.denominazione.trim().length > 0;
      const hasSede = this.citta.trim().length > 0 && this.paese.trim().length > 0;
      const hasEmail = (this.email || '').trim().length > 0 && !this.emailNonValida;
      const hasLingua = this.regIt || this.regEn;
      return !(hasDen && hasSede && hasEmail && hasLingua);
    },
    get salvaDisabilitato() { return this.nonSalvabile || this.saving; },
    // ---- Detail: dates, template provenance and update notice ----
    _fmtData(v) {
      if (!v) return '';
      try {
        // Date-only strings (YYYY-MM-DD) are built as local dates (no TZ shift).
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v));
        const dt = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
        if (isNaN(dt.getTime())) return String(v);
        const locale = this.lang === 'en' ? 'en-GB' : 'it-IT';
        return dt.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) { return String(v); }
    },
    _sostituisci(tpl, vals) {
      return String(tpl || '').replace(/\{(\w+)\}/g, (s, k) => (k in vals ? String(vals[k]) : s));
    },
    get provenienzaVm() {
      const vm = { date: '', template: '', aggiornamento: false, aggTitolo: '', aggTesto: '', aggNote: [] };
      const r = this.trattamentoCorrente;
      if (!r) return vm;
      const L = this.L;
      const md = r.metadata || {};
      const parti = [];
      if (md.createdAt) parti.push(this._sostituisci(L.provCreato, { data: this._fmtData(md.createdAt) }));
      if (md.updatedAt) parti.push(this._sostituisci(L.provModificato, { data: this._fmtData(md.updatedAt) }));
      vm.date = parti.join(' \u00b7 ');
      const tid = r.sourceTemplateId;
      if (!tid) return vm;
      const t = (this._rawTemplates || []).find((x) => x.templateId === tid);
      if (!t) return vm;
      const nome = this._loc(t.nome) || tid;
      const vRec = typeof r.sourceTemplateVersion === 'number' ? r.sourceTemplateVersion : null;
      const log = Array.isArray(t.changelog) ? t.changelog : [];
      const voceRec = vRec !== null ? log.find((c) => c.version === vRec) : null;
      if (vRec === null) {
        vm.template = this._sostituisci(L.provTemplate, { nome });
      } else {
        vm.template = this._sostituisci(voceRec ? L.provTemplateVersioneData : L.provTemplateVersione,
          { nome, v: vRec, data: voceRec ? this._fmtData(voceRec.date) : '' });
      }
      // Update notice: informative only, the record is never changed automatically.
      if (vRec !== null && typeof t.version === 'number' && t.version > vRec) {
        const voceNuova = log.find((c) => c.version === t.version);
        vm.aggiornamento = true;
        vm.aggTitolo = L.provAggTitolo;
        vm.aggTesto = this._sostituisci(voceNuova ? L.provAggTestoData : L.provAggTesto,
          { nome, v: t.version, data: voceNuova ? this._fmtData(voceNuova.date) : '' });
        vm.aggNote = log
          .filter((c) => typeof c.version === 'number' && c.version > vRec)
          .sort((a, b) => b.version - a.version)
          .map((c) => this._sostituisci(L.provAggNota,
            { v: c.version, data: this._fmtData(c.date), nota: this._loc(c.notes) || '' }));
      }
      return vm;
    },
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
        const settoreCode = t.settore || 'comune';
        const settmap = SETTORE_LABEL[this.lang] || SETTORE_LABEL.it;
        const settoreLabel = settmap[settoreCode] || settoreCode || '';
        const blob = (nomeLoc + ' ' + descrizioneLoc + ' ' + categoriaLabel + ' ' + settoreLabel).toLowerCase();
        return {
          id: t.templateId, categoriaLabel, nomeLoc, settore: settoreCode, settoreLabel,
          descrizioneLoc: this._tronca(descrizioneLoc, 160), _blob: blob,
          ariaAggiungi: this.L.btnCrea + ': ' + nomeLoc
        };
      });
      this._filtraCatalogo();
    },
    _filtraCatalogo() {
      const q = (this.queryCatalogo || '').trim().toLowerCase();
      const set = this.filtroSettore || '';
      this.templatesFiltrati = this.templates.filter((t) => {
        const okQ = !q || t._blob.indexOf(q) !== -1;
        let okS = true;
        if (set === 'comune') okS = (t.settore === 'comune');
        else if (set) okS = (t.settore === 'comune' || t.settore === set);
        return okQ && okS;
      });
    },
    // Sectors offered by the catalogue filter: only those that actually have
    // templates in the catalogue, in the canonical order of the sector list
    // (any sector not in that list follows, in catalogue order). A sector added
    // to templates.json appears in the filter without code changes.
    get settoriDisponibili() {
      const ordine = Object.keys((SETTORE_LABEL[this.lang] || SETTORE_LABEL.it) || {});
      const presenti = [];
      for (const t of (this.templates || [])) {
        if (t.settore && presenti.indexOf(t.settore) === -1) presenti.push(t.settore);
      }
      const noti = ordine.filter((code) => presenti.indexOf(code) !== -1);
      return noti.concat(presenti.filter((code) => ordine.indexOf(code) === -1));
    },
    get settoriOpzioni() {
      const m = (SETTORE_LABEL[this.lang] || SETTORE_LABEL.it) || {};
      return this.settoriDisponibili.map((code) => ({ code: code, label: m[code] || code }));
    },
    pulisciCatalogo() { this.queryCatalogo = ''; },

    // ---- List ----
    async caricaTrattamenti(highlightId = null) {
      this.nuovoTrattamentoId = highlightId;
      this._rawTrattamenti = await listProcessingActivities(this.registroAttivo);
      this._mappaTrattamenti();
    },
    get ariaPressedTitolare() { return this.registroAttivo === 'titolare' ? 'true' : 'false'; },
    get ariaPressedResponsabile() { return this.registroAttivo === 'responsabile' ? 'true' : 'false'; },
    get clsTabTitolare() {
      const base = 'px-5 py-2.5 text-base font-medium rounded-lg border ';
      if (this.registroAttivo === 'titolare') return base + 'bg-brand-700 text-white border-brand-700';
      return base + 'bg-white text-brand-700 border-brand-300 hover:bg-brand-50';
    },
    get clsTabResponsabile() {
      const base = 'px-5 py-2.5 text-base font-medium rounded-lg border ';
      if (this.registroAttivo === 'responsabile') return base + 'bg-brand-700 text-white border-brand-700';
      return base + 'bg-white text-brand-700 border-brand-300 hover:bg-brand-50';
    },
    async cambiaRegistro(tipo) {
      if (tipo !== 'titolare' && tipo !== 'responsabile') return;
      if (this.registroAttivo === tipo) return;
      this.registroAttivo = tipo;
      this.queryRicerca = '';
      await this.caricaTrattamenti();
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
        const unitaList = (Array.isArray(r.unitaOrganizzativa) ? r.unitaOrganizzativa : [])
          .map((u) => this._locConFallback(u && u.unita).testo)
          .filter(Boolean);
        const blob = (
          (r.nome ? (r.nome.it || '') + ' ' + (r.nome.en || '') : '') + ' ' +
          (Array.isArray(r.finalita) ? r.finalita.map((f) => (f.it || '') + ' ' + (f.en || '')).join(' ') : '') + ' ' +
          basi.join(' ') + ' ' +
          unitaList.join(' ')
        ).toLowerCase();

        return {
          id: r.id, nome, nomeMancante, badgeMancante,
          cssNome: nomeMancante ? 'italic text-brand-500' : '',
          finalitaSintesi, basiSintesi, categoriaLabel,
          mostraCategoria: categoriaLabel.length > 0,
          cssEvidenzia: evidenziato ? 'ring-2 ring-brand-400' : '',
          unitaList: unitaList,
          _blob: blob
        };
      });
      this._filtra();
    },
    _filtra() {
      const q = (this.queryRicerca || '').trim().toLowerCase();
      const u = this.filtroUnita || '';
      this.trattamentiFiltrati = this.trattamenti.filter((t) => {
        const okQ = !q || t._blob.indexOf(q) !== -1;
        const okU = !u || (Array.isArray(t.unitaList) && t.unitaList.indexOf(u) !== -1);
        return okQ && okU;
      });
    },
    get unitaDisponibili() {
      const set = {};
      for (const t of this.trattamenti) {
        for (const u of (t.unitaList || [])) { if (u) set[u] = true; }
      }
      return Object.keys(set).sort((a, b) => a.localeCompare(b, this.lang === 'en' ? 'en' : 'it'));
    },
    pulisciRicerca() { this.queryRicerca = ''; },

    // ---- Footer: contatto email (indirizzo non in chiaro nel markup) ----
    mailSupport() {
      const localPart = 'support';
      const domain = 'ropa30.eu';
      window.location.href = 'mailto:' + localPart + '@' + domain;
    },

    // ---- Create from template ----
    async creaDaTemplate(event) {
      if (this.creazioneInCorso) return;
      const id = (event && event.currentTarget && event.currentTarget.dataset)
        ? event.currentTarget.dataset.templateId : '';
      if (!id) return;
      this.creazioneInCorso = true;
      this.erroreCreazione = false;
      try {
        const nuovo = await createProcessingActivityFromTemplate(id, this.registroAttivo);
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

    // ---- Encrypted backup (optional) ----
    _azzeraBackupCifrato() {
      this.bcPassword = '';
      this.bcConferma = '';
      this.bcCapito = false;
      this.bcErrore = '';
    },
    // Length measured on the NFC form, as in crypto/backup-crypto.js.
    _lunghezzaPw(pw) { return (pw || '').normalize('NFC').length; },
    get bcPasswordCorta() {
      const n = this._lunghezzaPw(this.bcPassword);
      return n > 0 && n < MIN_PASSWORD_LENGTH;
    },
    get bcNonCoincide() {
      return this.bcConferma.length > 0 && this.bcPassword !== this.bcConferma;
    },
    get bcDisabilitato() {
      return this.bcInCorso ||
        this._lunghezzaPw(this.bcPassword) < MIN_PASSWORD_LENGTH ||
        this.bcPassword !== this.bcConferma ||
        !this.bcCapito;
    },
    annullaBackupCifrato() {
      this.isBackupCifratoOpen = false;
      this._azzeraBackupCifrato();
    },
    async confermaBackupCifrato() {
      if (this.bcDisabilitato) return;
      this.bcInCorso = true;
      this.bcErrore = '';
      try {
        const envelope = await exportAllData();
        const cifrato = await encryptEnvelope(envelope, this.bcPassword);
        scaricaBackup(cifrato, new Date(), '-cifrato');
        this.isBackupCifratoOpen = false;
        this._azzeraBackupCifrato();
      } catch (err) {
        const code = (err && err.message) || '';
        console.error('[ropa30] confermaBackupCifrato() error:', code);
        this.bcErrore = (code === 'CRYPTO_UNAVAILABLE') ? this.L.cryptoNonDisponibile : this.L.bcErrore;
      } finally {
        this.bcInCorso = false;
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
        const letto = await leggiFileBackup(file);
        if (isEncryptedEnvelope(letto)) {
          // Encrypted backup: ask for the password; confermaPasswordRestore()
          // then continues with the decrypted envelope.
          this.restoreCifrato = letto;
          this.rpPassword = '';
          this.rpErrore = '';
          this.isRestorePasswordOpen = true;
          return;
        }
        this._preparaRestore(letto);
      } catch (err) {
        console.error('[ropa30] fileSelezionato() error:', err);
        this.restoreError = true;
        const code = (err && err.message) || 'READ_ERROR';
        this.restoreMessage = (this.L.restoreErroreFile || 'File non valido') + ' (' + code + ')';
      }
    },

    // Validates a (plain or decrypted) envelope and opens the confirmation
    // dialog. NEVER touches the DB here.
    _preparaRestore(envelope) {
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
    },

    // ---- Restore of an encrypted backup: password step ----
    get rpDisabilitato() { return this.rpInCorso || this.rpPassword.length === 0; },
    async confermaPasswordRestore() {
      if (this.rpDisabilitato || !this.restoreCifrato) return;
      this.rpInCorso = true;
      this.rpErrore = '';
      try {
        // Deep-clone to strip the Alpine Proxy before decoding.
        const plain = JSON.parse(JSON.stringify(this.restoreCifrato));
        const envelope = await decryptEnvelope(plain, this.rpPassword);
        this.isRestorePasswordOpen = false;
        this.restoreCifrato = null;
        this.rpPassword = '';
        this._preparaRestore(envelope);
      } catch (err) {
        const code = (err && err.message) || '';
        console.error('[ropa30] confermaPasswordRestore() error:', code);
        if (code === 'DECRYPT_FAILED') this.rpErrore = this.L.rpErrorePassword;
        else if (code === 'CRYPTO_UNAVAILABLE') this.rpErrore = this.L.cryptoNonDisponibile;
        else this.rpErrore = (this.L.restoreErroreFile || 'File non valido') + ' (' + code + ')';
      } finally {
        this.rpInCorso = false;
      }
    },
    annullaPasswordRestore() {
      this.isRestorePasswordOpen = false;
      this.restoreCifrato = null;
      this.rpPassword = '';
      this.rpErrore = '';
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
        sitoWeb: this.sitoWeb, rappPresente: this.rappPresente,
        rappDenominazione: this.rappDenominazione, rappContatto: this.rappContatto,
        dpoNominato: this.dpoNominato, dpoNome: this.dpoNome,
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
    chiediElimina() {
      if (!this.trattamentoCorrente) return;
      this.isEliminaConfirmOpen = true;
    },
    annullaElimina() {
      this.isEliminaConfirmOpen = false;
    },
    async confermaElimina() {
      if (this.eliminaInCorso || !this.trattamentoCorrente) return;
      this.eliminaInCorso = true;
      const id = this.trattamentoCorrente.id;
      try {
        await deleteProcessingActivity(id);
        await this.caricaTrattamenti();
        this.isEliminaConfirmOpen = false;
        this.tornaAllaLista();
        this.exportMessage = this.L.eliminaFatto || 'Trattamento eliminato';
        this.exportError = false;
      } catch (err) {
        console.error('[ropa30] confermaElimina() error:', err);
        this.isEliminaConfirmOpen = false;
        this.exportError = true;
        this.exportMessage = this.L.eliminaErrore || 'Errore durante l\u2019eliminazione';
      } finally {
        this.eliminaInCorso = false;
      }
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
          lingue: this.editLingue, detail: loc.detail, enums: loc.enums, guida: loc.guida,
          azioni: this._azioniEditor()
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
    // Open/close the contextual GDPR guidance of an editor field (button data-guida).
    // Organisation sheet guidance: texts and button names for the UI language.
    get guidaOrgSezioni() {
      const loc = LOCALI[this.lang] || LOCALI.it;
      const G = loc.guidaOrg || {};
      const P = (loc.guida && loc.guida._pulsante) || '';
      const L = loc.ui;
      const titoli = {
        titolare: L.onbSezioneTitolare, indirizzo: L.onbSezioneIndirizzo,
        contatti: L.onbSezioneContatti, rappresentante: L.onbSezioneRappresentante,
        dpo: L.onbSezioneDpo, registro: L.onbSezioneRegistro
      };
      const out = {};
      for (const k of Object.keys(titoli)) out[k] = { testo: G[k] || '', aria: P + ': ' + (titoli[k] || '') };
      return out;
    },
    toggleGuidaOrg(event) {
      const k = event && event.currentTarget && event.currentTarget.dataset
        ? event.currentTarget.dataset.guidaOrg : '';
      if (k && Object.prototype.hasOwnProperty.call(this.guidaOrgAperta, k)) {
        this.guidaOrgAperta[k] = !this.guidaOrgAperta[k];
      }
    },
    toggleGuida(event) {
      const id = event && event.currentTarget && event.currentTarget.dataset
        ? event.currentTarget.dataset.guida : '';
      const c = trovaPerIdGuida(this.editModel, id);
      if (c) c.guidaAperta = !c.guidaAperta;
    },
    segnaDirty() {
      this.editDirty = true;
      this._validaNomeEditor();
      aggiornaVisibilita(this.editModel); // e.g. parties shown per type of record
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
    // Interface labels used to name repeated items and their buttons.
    _azioniEditor() {
      const L = this.L;
      return { aggiungiVoce: L.editorAggiungiVoce, aggiungiElemento: L.editorAggiungiElemento, rimuovi: L.editorRimuovi };
    },
    aggiungiVoce(event) {
      const { campo } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.voci)) {
        campo.voci.push(nuovaVoceLista());
        numeraVoci(campo, this._azioniEditor());
        this.segnaDirty();
      }
    },
    rimuoviVoce(event) {
      const { campo, idx } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.voci) && idx >= 0 && idx < campo.voci.length) {
        campo.voci.splice(idx, 1);
        numeraVoci(campo, this._azioniEditor());
        this.segnaDirty();
      }
    },
    aggiungiRiga(event) {
      const { campo } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.righe)) {
        const loc = LOCALI[this.lang] || localeIt;
        campo.righe.push(nuovaRigaGruppo(campo.gruppoTipo, { detail: loc.detail, enums: loc.enums, guida: loc.guida }));
        numeraVoci(campo, this._azioniEditor());
        this.segnaDirty();
      }
    },
    rimuoviRiga(event) {
      const { campo, idx } = this._campoDaEvento(event);
      if (campo && Array.isArray(campo.righe) && idx >= 0 && idx < campo.righe.length) {
        campo.righe.splice(idx, 1);
        numeraVoci(campo, this._azioniEditor());
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
          telefono: this.telefono.trim(), sitoWeb: this.sitoWeb.trim(),
          // Art. 27 representative: Art. 30(1)(a) and 30(2)(a), where applicable.
          rappresentante: {
            presente: this.rappPresente,
            denominazione: this.rappPresente ? this.rappDenominazione.trim() : '',
            contatto: this.rappPresente ? this.rappContatto.trim() : ''
          }
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
// ACCESSIBILITY: focus management for modal dialogs (WCAG 2.1 AA 2.4.3, 2.1.2).
// Every [role=dialog][aria-modal=true] that becomes visible receives focus (its
// first text field, otherwise the dialog itself, so that screen readers announce
// its title); Tab and Shift+Tab stay inside the topmost open dialog; when the
// dialog closes, focus returns to the control that opened it. Escape is already
// handled by each dialog. Plain DOM code, no Alpine expressions (CSP-safe).
// ============================================================================
(function gestioneFocusDialoghi() {
  const SEL_DIALOGO = '[role="dialog"][aria-modal="true"]';
  const SEL_FOCUS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), '
    + 'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const SEL_CAMPI = 'input:not([disabled]):not([type="hidden"]):not([type="checkbox"]):not([type="file"]), '
    + 'select:not([disabled]), textarea:not([disabled])';
  const visibile = (el) => !!el && el.isConnected && el.getClientRects().length > 0
    && getComputedStyle(el).visibility !== 'hidden';
  const focalizzabili = (d) => Array.from(d.querySelectorAll(SEL_FOCUS)).filter(visibile);
  const pila = [];          // [{ dialogo, apertoDa }]
  let ultimoApritore = null; // last opener outside any dialog

  function focalizzaIniziale(d) {
    if (!visibile(d) || d.contains(document.activeElement)) return;
    const campo = Array.from(d.querySelectorAll(SEL_CAMPI)).find(visibile);
    if (campo) { campo.focus(); return; }
    if (!d.hasAttribute('tabindex')) d.setAttribute('tabindex', '-1');
    d.focus();
  }
  function sincronizza() {
    const aperti = Array.from(document.querySelectorAll(SEL_DIALOGO)).filter(visibile);
    for (let i = pila.length - 1; i >= 0; i--) {
      if (aperti.includes(pila[i].dialogo)) continue;
      const { apertoDa } = pila.splice(i, 1)[0];
      if (i === pila.length) {
        const cima = pila[pila.length - 1];
        if (cima) focalizzaIniziale(cima.dialogo);
        else if (visibile(apertoDa)) apertoDa.focus();
        else if (visibile(ultimoApritore)) ultimoApritore.focus();
      }
    }
    for (const d of aperti) {
      if (pila.some((x) => x.dialogo === d)) continue;
      const apertoDa = document.activeElement;
      if (apertoDa && !apertoDa.closest(SEL_DIALOGO)) ultimoApritore = apertoDa;
      pila.push({ dialogo: d, apertoDa });
      requestAnimationFrame(() => focalizzaIniziale(d));
    }
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !pila.length) return;
    const d = pila[pila.length - 1].dialogo;
    const f = focalizzabili(d);
    if (!f.length) { e.preventDefault(); return; }
    const primo = f[0];
    const ultimo = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); primo.focus(); }
    else if (e.shiftKey && (document.activeElement === primo || document.activeElement === d)) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primo.focus(); }
  });
  const avvia = () => {
    new MutationObserver(sincronizza).observe(document.body, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'hidden']
    });
    sincronizza();
  };
  if (document.body) avvia(); else document.addEventListener('DOMContentLoaded', avvia);
})();

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

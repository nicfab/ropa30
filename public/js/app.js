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
  listAvailableTemplates,
  createProcessingActivityFromTemplate
} from './db.js';

import localeIt from '../locales/it.js';
import localeEn from '../locales/en.js';
import { buildDettaglio } from './detail.js';

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
    trattamentiFiltrati: [],
    queryRicerca: '',
    nuovoTrattamentoId: null,

    // Detail (read-only)
    trattamentoCorrente: null,
    trattamentoVm: null,
    trattamentoTitolo: '',

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

    async init() {
      try {
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

        // Register languages from settings.registro.
        const reg = settings.registro || { lingue: ['it'], linguaPrincipale: 'it' };
        const lingue = Array.isArray(reg.lingue) && reg.lingue.length ? reg.lingue : ['it'];
        this.regIt = lingue.indexOf('it') !== -1;
        this.regEn = lingue.indexOf('en') !== -1;
        if (!this.regIt && !this.regEn) this.regIt = true;
        const princ = (reg.linguaPrincipale === 'en' || reg.linguaPrincipale === 'it') ? reg.linguaPrincipale : 'it';
        this.regPrincipale = (this[princ === 'en' ? 'regEn' : 'regIt']) ? princ : (this.regIt ? 'it' : 'en');

        await this._assicuraCatalogo();
        await this.caricaTrattamenti();

        this.view = (this.denominazione.trim() === '') ? 'onboarding' : 'lista';

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
    get isViewOnboarding() { return this.view === 'onboarding'; },
    get isViewLista()      { return this.view === 'lista'; },
    get isViewDettaglio() { return this.view === 'dettaglio'; },
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
      const hasDen = this.denominazione.trim().length > 0;
      const hasCont = this.email.trim().length > 0 || this.pec.trim().length > 0;
      const hasLingua = this.regIt || this.regEn;
      return !(hasDen && hasCont && hasLingua);
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

    // ---- Navigation ----
    vaiAOnboarding() { this.erroreSalvataggio = false; this.view = 'onboarding'; },
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

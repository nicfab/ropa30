/*
 * ropa30 — app.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Alpine.js component for ropa30 (CSP-safe build, @alpinejs/csp).
 * Settings schema v2: uiLanguage (display) + registro {lingue, linguaPrincipale}.
 * Multilingual reading: active-language text; strict (no silent fallback) for
 * lists; attenuated fallback + "missing translation" badge for the title only.
 */

import {
  getSettings,
  updateSettings,
  listProcessingActivities,
  listAvailableTemplates,
  createProcessingActivityFromTemplate
} from './db.js';

function ropa30App() {
  const CATEGORIA_LABEL = {
    it: { marketing: 'Marketing', risorse_umane: 'Risorse umane', sicurezza: 'Sicurezza',
      clientela: 'Clientela', fornitori: 'Fornitori', amministrazione: 'Amministrazione',
      legale: 'Legale', web: 'Web' },
    en: { marketing: 'Marketing', risorse_umane: 'Human resources', sicurezza: 'Security',
      clientela: 'Customers', fornitori: 'Suppliers', amministrazione: 'Administration',
      legale: 'Legal', web: 'Web' }
  };

  const ART6_LABEL = {
    it: { consenso: 'Consenso', contratto: 'Contratto', obbligo_legale: 'Obbligo legale',
      interesse_vitale: 'Interesse vitale', interesse_pubblico: 'Interesse pubblico',
      legittimo_interesse: 'Legittimo interesse' },
    en: { consenso: 'Consent', contratto: 'Contract', obbligo_legale: 'Legal obligation',
      interesse_vitale: 'Vital interest', interesse_pubblico: 'Public interest',
      legittimo_interesse: 'Legitimate interest' }
  };

  const translations = {
    it: {
      appTitle: 'ropa30 — Il registro dei trattamenti GDPR, semplice.',
      appDescription: 'Il registro delle attività di trattamento ex art. 30 GDPR, semplice e gratuito.',
      langSwitcherLabel: 'Lingua',
      skipToContent: 'Vai al contenuto principale',
      brandTagline: 'Il registro dei trattamenti GDPR, semplice.',
      footerLicense: 'Rilasciato sotto AGPL-3.0-or-later',
      footerAuthor: 'Realizzato da',

      onbTitolo: 'Configura il registro',
      onbSottotitolo: 'Inserisci i dati del titolare del trattamento e, se nominato, del Responsabile della protezione dei dati (DPO). Questi dati costituiscono l\u2019intestazione del tuo registro ex art. 30 GDPR. Restano sul tuo dispositivo: non lasciano mai il browser.',
      onbSezioneTitolare: 'Titolare del trattamento',
      onbSezioneIndirizzo: 'Indirizzo',
      onbSezioneContatti: 'Contatti',
      onbSezioneDpo: 'Responsabile della protezione dei dati (DPO)',
      onbSezioneRegistro: 'Registro',
      lblDenominazione: 'Denominazione *',
      lblFormaGiuridica: 'Forma giuridica',
      lblCodiceFiscale: 'Codice fiscale',
      lblPartitaIVA: 'Partita IVA',
      lblTelefono: 'Telefono',
      lblVia: 'Via', lblCivico: 'Civico', lblCap: 'CAP', lblCitta: 'Citt\u00e0',
      lblProvincia: 'Provincia', lblPaese: 'Paese',
      lblEmail: 'Email', lblPec: 'PEC', lblSitoWeb: 'Sito web',
      lblDpoNominato: '\u00c8 stato nominato un DPO',
      lblDpoNome: 'Nome / denominazione del DPO',
      lblDpoEmail: 'Email del DPO', lblDpoPec: 'PEC del DPO',
      lblLingua: 'Lingua del registro', lblDataCreazione: 'Data di creazione',
      onbObbligatorio: '* Campo obbligatorio. Indica inoltre almeno una email o una PEC del titolare.',
      onbErrore: 'Si \u00e8 verificato un errore durante il salvataggio. Riprova.',
      btnSalva: 'Salva e continua',

      listaTitolo: 'Registro dei trattamenti',
      listaModificaTitolare: 'Modifica dati titolare',
      listaVuotaTitolo: 'Nessun trattamento presente',
      listaVuotaTesto: 'Il registro \u00e8 vuoto. Aggiungi il primo trattamento partendo da un template.',
      btnAggiungiTrattamento: 'Aggiungi trattamento',
      listaFinalita: 'Finalit\u00e0',
      listaBaseGiuridica: 'Base giuridica',
      creazioneErrore: 'Non \u00e8 stato possibile aggiungere il trattamento. Riprova.',
      cercaPlaceholder: 'Cerca per nome, finalit\u00e0 o base giuridica\u2026',
      cercaAria: 'Cerca tra i trattamenti',
      contatoreUno: 'trattamento',
      contatoreMolti: 'trattamenti',
      nessunRisultatoTitolo: 'Nessun risultato',
      nessunRisultatoTesto: 'Nessun trattamento corrisponde alla ricerca. Prova con altri termini.',
      btnPulisci: 'Pulisci',
      sennaNome: '(senza nome)',
      mancaEN: 'Manca EN',
      mancaIT: 'Manca IT',

      catalogoTitolo: 'Scegli un template',
      catalogoSottotitolo: 'Seleziona un modello da cui partire: verr\u00e0 aggiunto al registro e potrai personalizzarlo.',
      catalogoDisclaimer: 'I template sono punti di partenza redatti con cura, ma vanno adattati alla tua realt\u00e0 e verificati. Non costituiscono consulenza legale.',
      catalogoCercaPlaceholder: 'Cerca un template\u2026',
      catalogoCercaAria: 'Cerca tra i template',
      catalogoNessunRisultato: 'Nessun template corrisponde alla ricerca.',
      btnCrea: 'Aggiungi',
      btnChiudi: 'Chiudi'
    },
    en: {
      appTitle: 'ropa30 — The GDPR Article 30 register, simplified.',
      appDescription: 'The GDPR Article 30 register, simplified. A free, local-only web app.',
      langSwitcherLabel: 'Language',
      skipToContent: 'Skip to main content',
      brandTagline: 'The GDPR Article 30 register, simplified.',
      footerLicense: 'Released under AGPL-3.0-or-later',
      footerAuthor: 'Built by',

      onbTitolo: 'Set up your register',
      onbSottotitolo: 'Enter the data controller\u2019s details and, if appointed, the Data Protection Officer (DPO). These details form the header of your Article 30 GDPR register. Everything stays on your device: it never leaves the browser.',
      onbSezioneTitolare: 'Data controller',
      onbSezioneIndirizzo: 'Address',
      onbSezioneContatti: 'Contacts',
      onbSezioneDpo: 'Data Protection Officer (DPO)',
      onbSezioneRegistro: 'Register',
      lblDenominazione: 'Name *',
      lblFormaGiuridica: 'Legal form',
      lblCodiceFiscale: 'Tax code',
      lblPartitaIVA: 'VAT number',
      lblTelefono: 'Phone',
      lblVia: 'Street', lblCivico: 'No.', lblCap: 'Postal code', lblCitta: 'City',
      lblProvincia: 'Province', lblPaese: 'Country',
      lblEmail: 'Email', lblPec: 'Certified email (PEC)', lblSitoWeb: 'Website',
      lblDpoNominato: 'A DPO has been appointed',
      lblDpoNome: 'DPO name',
      lblDpoEmail: 'DPO email', lblDpoPec: 'DPO certified email (PEC)',
      lblLingua: 'Register language', lblDataCreazione: 'Creation date',
      onbObbligatorio: '* Required. Also provide at least an email or a certified email (PEC) for the controller.',
      onbErrore: 'An error occurred while saving. Please try again.',
      btnSalva: 'Save and continue',

      listaTitolo: 'Record of processing activities',
      listaModificaTitolare: 'Edit controller details',
      listaVuotaTitolo: 'No processing activities yet',
      listaVuotaTesto: 'Your register is empty. Add your first activity starting from a template.',
      btnAggiungiTrattamento: 'Add activity',
      listaFinalita: 'Purposes',
      listaBaseGiuridica: 'Legal basis',
      creazioneErrore: 'The activity could not be added. Please try again.',
      cercaPlaceholder: 'Search by name, purpose or legal basis\u2026',
      cercaAria: 'Search activities',
      contatoreUno: 'activity',
      contatoreMolti: 'activities',
      nessunRisultatoTitolo: 'No results',
      nessunRisultatoTesto: 'No activity matches your search. Try different terms.',
      btnPulisci: 'Clear',
      sennaNome: '(untitled)',
      mancaEN: 'Missing EN',
      mancaIT: 'Missing IT',

      catalogoTitolo: 'Choose a template',
      catalogoSottotitolo: 'Pick a model to start from: it will be added to your register and you can customise it.',
      catalogoDisclaimer: 'Templates are carefully drafted starting points, but must be adapted to your context and verified. They do not constitute legal advice.',
      catalogoCercaPlaceholder: 'Search a template\u2026',
      catalogoCercaAria: 'Search templates',
      catalogoNessunRisultato: 'No template matches your search.',
      btnCrea: 'Add',
      btnChiudi: 'Close'
    }
  };

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
    lingua: 'it',

    // List
    _rawTrattamenti: [],
    trattamenti: [],
    trattamentiFiltrati: [],
    queryRicerca: '',
    nuovoTrattamentoId: null,

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
        this.lang = lng; this.lingua = lng;
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

        await this._assicuraCatalogo();
        await this.caricaTrattamenti();

        this.view = (this.denominazione.trim() === '') ? 'onboarding' : 'lista';

        this.$watch('lang', () => { this._mappaTrattamenti(); this._mappaTemplates(); });
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

    // ---- Onboarding validation ----
    get nonSalvabile() {
      const hasDen = this.denominazione.trim().length > 0;
      const hasCont = this.email.trim().length > 0 || this.pec.trim().length > 0;
      return !(hasDen && hasCont);
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

    // ---- Localization helpers ----
    // Active language only; '' if missing (NO silent fallback).
    _locStrict(obj) {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'object') return obj[this.lang] || '';
      return String(obj);
    },
    // Returns {testo, mancante, fallback} for the title.
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
    // For template catalog (templates are always fully bilingual).
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
        // Title: attenuated fallback + badge if missing in active language.
        const tit = this._locConFallback(r.nome);
        const nome = tit.testo || this.L.sennaNome;
        const nomeMancante = tit.mancante;
        // The missing language is the active one (fallback came from the other).
        const badgeMancante = nomeMancante
          ? (this.lang === 'en' ? this.L.mancaEN : this.L.mancaIT)
          : '';

        // Purposes: strict (no silent fallback) -> '—' if empty in active lang.
        const fin = Array.isArray(r.finalita)
          ? r.finalita.map((f) => this._locStrict(f)).filter(Boolean) : [];
        let finalitaSintesi = fin.slice(0, 2).join('; ');
        if (fin.length > 2) finalitaSintesi += '\u2026';
        if (!finalitaSintesi) finalitaSintesi = '\u2014';

        // Legal basis: enum codes -> translated labels (always available).
        const art6 = (r.baseGiuridica && Array.isArray(r.baseGiuridica.art6)) ? r.baseGiuridica.art6 : [];
        const basi = art6.map((k) => art6map[k] || k);
        const basiSintesi = basi.length ? basi.join(', ') : '\u2014';

        const cat = this._catByTemplateId[r.sourceTemplateId || ''] || '';
        const categoriaLabel = cat ? (catmap[cat] || cat) : '';

        const evidenziato = !!this.nuovoTrattamentoId && r.id === this.nuovoTrattamentoId;
        // Search haystack: both languages, so search works regardless of active lang.
        const blob = (
          (r.nome ? (r.nome.it || '') + ' ' + (r.nome.en || '') : '') + ' ' +
          (Array.isArray(r.finalita) ? r.finalita.map((f) => (f.it || '') + ' ' + (f.en || '')).join(' ') : '') + ' ' +
          basi.join(' ')
        ).toLowerCase();

        return {
          id: r.id,
          nome,
          nomeMancante,
          badgeMancante,
          cssNome: nomeMancante ? 'italic text-brand-400' : '',
          finalitaSintesi,
          basiSintesi,
          categoriaLabel,
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

    setLang(event) {
      const newLang = event.target.value;
      if (newLang === 'it' || newLang === 'en') {
        this.lang = newLang;
        document.documentElement.setAttribute('lang', newLang);
      }
    },

    async salvaOnboarding() {
      if (this.nonSalvabile || this.saving) return;
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
        const lingua = this.lingua === 'en' ? 'en' : 'it';
        // Settings v2: uiLanguage + monolingual register (M5 will add 2 languages).
        await updateSettings({
          titolare, dpo,
          uiLanguage: lingua,
          registro: { lingue: [lingua], linguaPrincipale: lingua }
        });
        this.lang = lingua;
        document.documentElement.setAttribute('lang', lingua);
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

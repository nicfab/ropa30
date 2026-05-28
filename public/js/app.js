/*
 * ropa30 — app.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Alpine.js component for ropa30 (CSP-safe build, @alpinejs/csp).
 *
 * CSP constraint: HTML attributes may reference *property/method names* and
 * simple member paths only — never expressions. Therefore:
 *  - x-model targets are flat, single-name properties (denominazione, via, ...).
 *  - Translated strings are read via a single getter `L` (e.g. x-text="L.onbTitolo").
 *  - Event handlers are method names with no arguments (e.g. x-on:click="salvaOnboarding").
 *
 * The component is registered with Alpine via Alpine.data('ropa30App', ...)
 * inside the alpine:init listener at the bottom of this file (both this script
 * and alpine.min.js use defer, preserving document order).
 *
 * In later phases translations will move to public/locales/{it,en}.json.
 */

import { getSettings, updateSettings } from './db.js';

function ropa30App() {
  const translations = {
    it: {
      // App-level (header / footer / <title>) — bound via single getters below.
      appTitle: 'ropa30 — Il registro dei trattamenti GDPR, semplice.',
      appDescription: 'Il registro delle attività di trattamento ex art. 30 GDPR, semplice e gratuito.',
      langSwitcherLabel: 'Lingua',
      skipToContent: 'Vai al contenuto principale',
      brandTagline: 'Il registro dei trattamenti GDPR, semplice.',
      footerLicense: 'Rilasciato sotto AGPL-3.0-or-later',
      footerAuthor: 'Realizzato da',

      // Onboarding
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
      lblVia: 'Via',
      lblCivico: 'Civico',
      lblCap: 'CAP',
      lblCitta: 'Citt\u00e0',
      lblProvincia: 'Provincia',
      lblPaese: 'Paese',
      lblEmail: 'Email',
      lblPec: 'PEC',
      lblSitoWeb: 'Sito web',
      lblDpoNominato: '\u00c8 stato nominato un DPO',
      lblDpoNome: 'Nome / denominazione del DPO',
      lblDpoEmail: 'Email del DPO',
      lblDpoPec: 'PEC del DPO',
      lblLingua: 'Lingua del registro',
      lblDataCreazione: 'Data di creazione',

      onbObbligatorio: '* Campo obbligatorio. Indica inoltre almeno una email o una PEC del titolare.',
      onbErrore: 'Si \u00e8 verificato un errore durante il salvataggio. Riprova.',
      btnSalva: 'Salva e continua',

      // Lista (stub)
      listaTitolo: 'Registro dei trattamenti',
      listaModificaTitolare: 'Modifica dati titolare',
      listaVuotaTitolo: 'Nessun trattamento presente',
      listaVuotaTesto: 'Il registro \u00e8 vuoto. Nei prossimi passi potrai aggiungere trattamenti partendo da un template oppure crearne di nuovi.'
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
      lblVia: 'Street',
      lblCivico: 'No.',
      lblCap: 'Postal code',
      lblCitta: 'City',
      lblProvincia: 'Province',
      lblPaese: 'Country',
      lblEmail: 'Email',
      lblPec: 'Certified email (PEC)',
      lblSitoWeb: 'Website',
      lblDpoNominato: 'A DPO has been appointed',
      lblDpoNome: 'DPO name',
      lblDpoEmail: 'DPO email',
      lblDpoPec: 'DPO certified email (PEC)',
      lblLingua: 'Register language',
      lblDataCreazione: 'Creation date',

      onbObbligatorio: '* Required. Also provide at least an email or a certified email (PEC) for the controller.',
      onbErrore: 'An error occurred while saving. Please try again.',
      btnSalva: 'Save and continue',

      listaTitolo: 'Record of processing activities',
      listaModificaTitolare: 'Edit controller details',
      listaVuotaTitolo: 'No processing activities yet',
      listaVuotaTesto: 'Your register is empty. In the next steps you will be able to add activities from a template or create new ones.'
    }
  };

  return {
    // ---- Reactive state ----
    lang: 'it',
    view: '',                 // '' until init() decides: 'onboarding' | 'lista'
    saving: false,
    erroreSalvataggio: false,
    settingsCreatedAt: '',

    // ---- Onboarding form (flat, single-name x-model targets for CSP safety) ----
    denominazione: '',
    formaGiuridica: '',
    codiceFiscale: '',
    partitaIVA: '',
    telefono: '',
    via: '',
    civico: '',
    cap: '',
    citta: '',
    provincia: '',
    paese: 'IT',
    email: '',
    pec: '',
    sitoWeb: '',
    dpoNominato: false,
    dpoNome: '',
    dpoEmail: '',
    dpoPec: '',
    lingua: 'it',

    // ---- Lifecycle: Alpine auto-calls init() on component start ----
    async init() {
      try {
        const settings = await getSettings();

        const lng = (settings.lingua === 'en' || settings.lingua === 'it') ? settings.lingua : 'it';
        this.lang = lng;
        this.lingua = lng;
        document.documentElement.setAttribute('lang', lng);

        this.settingsCreatedAt = (settings.metadata && settings.metadata.createdAt) || '';

        const t = settings.titolare || {};
        const ind = t.indirizzo || {};
        this.denominazione = t.denominazione || '';
        this.formaGiuridica = t.formaGiuridica || '';
        this.codiceFiscale = t.codiceFiscale || '';
        this.partitaIVA = t.partitaIVA || '';
        this.telefono = t.telefono || '';
        this.via = ind.via || '';
        this.civico = ind.civico || '';
        this.cap = ind.cap || '';
        this.citta = ind.citta || '';
        this.provincia = ind.provincia || '';
        this.paese = ind.paese || 'IT';
        this.email = t.email || '';
        this.pec = t.pec || '';
        this.sitoWeb = t.sitoWeb || '';

        const d = settings.dpo || {};
        this.dpoNominato = !!d.nominato;
        this.dpoNome = d.nome || '';
        this.dpoEmail = d.email || '';
        this.dpoPec = d.pec || '';

        // First run (no controller name yet) -> onboarding; otherwise -> register.
        this.view = (this.denominazione.trim() === '') ? 'onboarding' : 'lista';
      } catch (err) {
        console.error('[ropa30] init() error:', err);
        this.view = 'onboarding';
      }
    },

    // ---- Translations (single getter; member access in templates is CSP-safe) ----
    get L() { return translations[this.lang]; },

    // ---- App-level single getters (header / footer / <title>) ----
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

    // ---- Language-switcher option state (header) ----
    get isItalianSelected() { return this.lang === 'it'; },
    get isEnglishSelected() { return this.lang === 'en'; },

    // ---- Validation: denominazione required + at least one of email/pec ----
    get nonSalvabile() {
      const hasDenominazione = this.denominazione.trim().length > 0;
      const hasContatto = this.email.trim().length > 0 || this.pec.trim().length > 0;
      return !(hasDenominazione && hasContatto);
    },
    get salvaDisabilitato() { return this.nonSalvabile || this.saving; },

    // ---- Read-only creation date (from settings.metadata.createdAt) ----
    get dataCreazioneVisuale() {
      if (!this.settingsCreatedAt) return '\u2014';
      try {
        const dt = new Date(this.settingsCreatedAt);
        if (isNaN(dt.getTime())) return this.settingsCreatedAt;
        const locale = this.lang === 'en' ? 'en-GB' : 'it-IT';
        return dt.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) {
        return this.settingsCreatedAt;
      }
    },

    // ---- Navigation ----
    vaiAOnboarding() { this.erroreSalvataggio = false; this.view = 'onboarding'; },
    vaiAllaLista()   { this.view = 'lista'; },

    // ---- Header language switcher (UI live language only; not persisted here) ----
    setLang(event) {
      const newLang = event.target.value;
      if (newLang === 'it' || newLang === 'en') {
        this.lang = newLang;
        document.documentElement.setAttribute('lang', newLang);
      }
    },

    // ---- Save onboarding into settings ----
    // updateSettings() merges only at the FIRST level, so we rebuild the full
    // titolare/dpo objects (touched fields + preserved untouched ones).
    async salvaOnboarding() {
      if (this.nonSalvabile || this.saving) return;
      this.saving = true;
      this.erroreSalvataggio = false;
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
            via: this.via.trim(),
            civico: this.civico.trim(),
            cap: this.cap.trim(),
            citta: this.citta.trim(),
            provincia: this.provincia.trim(),
            paese: this.paese.trim() || 'IT'
          },
          email: this.email.trim(),
          pec: this.pec.trim(),
          telefono: this.telefono.trim(),
          sitoWeb: this.sitoWeb.trim()
        };

        const dpo = {
          ...current.dpo,
          nominato: this.dpoNominato,
          nome: this.dpoNominato ? this.dpoNome.trim() : '',
          email: this.dpoNominato ? this.dpoEmail.trim() : '',
          pec: this.dpoNominato ? this.dpoPec.trim() : ''
        };

        const lingua = this.lingua === 'en' ? 'en' : 'it';

        await updateSettings({ titolare, dpo, lingua });

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

// Register the component before Alpine initializes (both scripts use defer).
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

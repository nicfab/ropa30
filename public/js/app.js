/*
 * ropa30 — app.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Alpine.js component for ropa30, written for the CSP-safe build
 * (@alpinejs/csp). HTML attributes can only reference property names,
 * not JavaScript expressions, so every "computed" value the template
 * needs is exposed here as a getter.
 *
 * This file is registered with Alpine via Alpine.data('ropa30App', ...)
 * inside init.js, which runs before alpine.min.js (CSP build) initializes.
 *
 * In later phases this file will be split into:
 * - app.js     (this file: top-level state + computed strings)
 * - i18n.js    (translations table)
 * - db.js      (IndexedDB / Dexie wrapper)
 * - schema.js  (ROPA data model + validation)
 */

function ropa30App() {
  // Translations are kept inline for now. They will move to
  // public/locales/{it,en}.json in Phase 5.
  const translations = {
    it: {
      appTitle: 'ropa30 — Il registro dei trattamenti GDPR, semplice.',
      appDescription: 'Il registro delle attività di trattamento ex art. 30 GDPR, semplice e gratuito.',
      langSwitcherLabel: 'Lingua',
      skipToContent: 'Vai al contenuto principale',
      brandTagline: 'Il registro dei trattamenti GDPR, semplice.',
      heroTitle: 'In costruzione',
      heroBody: 'ropa30 è in fase di sviluppo iniziale. Stiamo costruendo un\'applicazione web che ti aiuti a tenere il registro delle attività di trattamento richiesto dall\'articolo 30 del GDPR — in modo semplice, locale e privato.',
      statusLabel: 'Versione',
      statusValue: '0.0.0 — scaffolding completato',
      ctaCodebergLabel: 'Vedi il codice su Codeberg',
      footerLicense: 'Rilasciato sotto AGPL-3.0-or-later',
      footerAuthor: 'Realizzato da'
    },
    en: {
      appTitle: 'ropa30 — The GDPR Article 30 register, simplified.',
      appDescription: 'The GDPR Article 30 register, simplified. A free, local-only web app.',
      langSwitcherLabel: 'Language',
      skipToContent: 'Skip to main content',
      brandTagline: 'The GDPR Article 30 register, simplified.',
      heroTitle: 'Under construction',
      heroBody: 'ropa30 is in early development. We are building a web application that helps you maintain the Record of Processing Activities required by Article 30 of the GDPR — simply, locally, and privately.',
      statusLabel: 'Version',
      statusValue: '0.0.0 — scaffolding complete',
      ctaCodebergLabel: 'View source on Codeberg',
      footerLicense: 'Released under AGPL-3.0-or-later',
      footerAuthor: 'Built by'
    }
  };

  return {
    // ---- Reactive state ----
    lang: 'it',

    // ---- Computed string accessors ----
    // Each template binding (x-text, x-bind:content, etc.) references one of
    // these by name. They cannot be expressions in CSP mode, so we expose
    // every string the template needs as a dedicated getter.
    get appTitle()           { return translations[this.lang].appTitle; },
    get appDescription()     { return translations[this.lang].appDescription; },
    get langSwitcherLabel()  { return translations[this.lang].langSwitcherLabel; },
    get skipToContent()      { return translations[this.lang].skipToContent; },
    get brandTagline()       { return translations[this.lang].brandTagline; },
    get heroTitle()          { return translations[this.lang].heroTitle; },
    get heroBody()           { return translations[this.lang].heroBody; },
    get statusLabel()        { return translations[this.lang].statusLabel; },
    get statusValue()        { return translations[this.lang].statusValue; },
    get ctaCodebergLabel()   { return translations[this.lang].ctaCodebergLabel; },
    get footerLicense()      { return translations[this.lang].footerLicense; },
    get footerAuthor()       { return translations[this.lang].footerAuthor; },

    // ---- Selection helpers for the language switcher options ----
    // Used by :selected on each <option> via simple property names.
    get isItalianSelected()  { return this.lang === 'it'; },
    get isEnglishSelected()  { return this.lang === 'en'; },

    // ---- Event handler ----
    // In CSP mode, x-on:change="setLang" automatically passes $event
    // as the first argument. We read the selected value here.
    setLang(event) {
      const newLang = event.target.value;
      if (newLang === 'it' || newLang === 'en') {
        this.lang = newLang;
        document.documentElement.setAttribute('lang', newLang);
      }
    }
  };
}

// Register the component with Alpine before Alpine itself initializes.
// This works because both this script and alpine.min.js use `defer`,
// which preserves document load order.
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

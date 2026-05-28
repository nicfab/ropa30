/*
 * ropa30 — locales/en.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * English interface strings (i18n). This file holds ONLY UI text and the
 * human labels for enum codes — never user content of the register, which
 * lives in the database as bilingual {it,en} objects.
 *
 * Structure:
 *   ui     -> interface strings, keyed exactly as app.js expects (this.L.*)
 *   enums  -> code -> label maps, one group per schema enum
 *
 * Some enum groups are intentionally empty for now (scaffolding); they will
 * be populated in Step B (read-only detail view). app.js does not import the
 * empty ones yet, so leaving them empty is behavior-identical.
 */

export default {
  ui: {
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
    lblLingueRegistro: 'Register languages',
    lblLinguaPrincipale: 'Primary language',
    lblDataCreazione: 'Creation date',
    hintLingueRegistro: 'Choose which languages to draft the register in. Enable one or both; the primary language is used by default.',
    erroreNessunaLingua: 'Select at least one language for the register.',
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
  },

  enums: {
    categoria: {
      marketing: 'Marketing',
      risorse_umane: 'Human resources',
      sicurezza: 'Security',
      clientela: 'Customers',
      fornitori: 'Suppliers',
      amministrazione: 'Administration',
      legale: 'Legal',
      web: 'Web'
    },
    art6: {
      consenso: 'Consent',
      contratto: 'Contract',
      obbligo_legale: 'Legal obligation',
      interesse_vitale: 'Vital interest',
      interesse_pubblico: 'Public interest',
      legittimo_interesse: 'Legitimate interest'
    },

    // ---- Populated in Step B (not yet imported by app.js) ----
    art9: {},
    fonteDeiDati: {},
    azioneFinale: {},
    garanziaTrasferimento: {},
    tipoRegistro: {}
  }
};

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
    footerRepoLabel: 'Source & issues',
    footerEmailLabel: 'Email',
    footerRepoAria: 'Source code and issues on Codeberg (opens in a new tab)',
    footerEmailAria: 'Send a support email',
    btnAzioni: 'Actions',
    azioniTitolo: 'Register actions',
    azioniSottotitolo: 'Backup, restore, export and controller details.',
    azioniChiudi: 'Close',

    welcomeTitolo: 'Records of processing activities',

    welcomeIntro: 'ropa30 lets you create, update and export the Records of processing activities required by Art. 30 GDPR, local-first and without sending data to external servers.',

    welcomePunto1: 'Structure compliant with Art. 30 of Regulation (EU) 2016/679',

    welcomePunto2: 'Local-first: no account, no cloud, data kept in your browser',

    welcomePunto3: 'Open source, with register export to PDF, XLSX and ODS',

    welcomeComeIniziare: 'How would you like to start?',

    welcomeImportTitolo: 'I already have a backup',

    welcomeImportTesto: 'Import a JSON backup file and restore an existing register.',

    welcomeImportBtn: 'Import backup',

    welcomeNuovoTitolo: 'Start from scratch',

    welcomeNuovoTesto: 'Set up the register by entering the data controller’s details.',

    welcomeNuovoBtn: 'Start',

    welcomeNota: 'To start from scratch you need at least: controller name, register language and controller seat.',

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
    onbObbligatorio: '* Required to save: name, at least one register language, and the controller’s registered seat (city and country).',
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
    btnEsporta: 'Export / Backup',
    backupAvviso: 'This file contains personal data and is not encrypted. Keep it in a safe place.',
    erroreBackup: 'The backup could not be exported. Please try again.',
    cercaPlaceholder: 'Search by name, purpose or legal basis\u2026',
    cercaAria: 'Search activities',
    contatoreUno: 'activity',
    contatoreMolti: 'activities',
    nessunRisultatoTitolo: 'No results',
    nessunRisultatoTesto: 'No activity matches your search. Try different terms.',
    btnPulisci: 'Clear',
    filtroUnitaLabel: 'Filter by organizational unit',
    filtroUnitaTutte: 'All units',
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
    btnChiudi: 'Close',
    dettaglioTornaLista: 'Back to the register',
    dettaglioModifica: 'Edit',
    editorTitolo: 'Edit processing activity',
    editorSalva: 'Save',
    editorAnnulla: 'Cancel',
    editorErroreSalva: 'An error occurred while saving. Please try again.',
    editorNomeMancante: 'The name is required in the register\u2019s primary language.',
    editorAggiungiVoce: 'Add item',
    editorAggiungiElemento: 'Add entry',
    editorRimuovi: 'Remove',
    editorVuoto: 'No entries. Use \u201cAdd entry\u201d to insert one.',
    editorConfermaTitolo: 'Unsaved changes',
    editorConfermaTesto: 'You have unsaved changes. Are you sure you want to leave without saving?',
    editorConfermaEsci: 'Leave without saving',
    editorConfermaResta: 'Keep editing',
    editorColonnaIt: 'Italiano',
    editorColonnaEn: 'English',
    editorEspandiTutto: 'Expand all',
    editorComprimiTutto: 'Collapse all',
    restoreImporta: 'Import / Restore',
    restoreTitoloConferma: 'Confirm restore?',
    restoreDisclaimerBackup: 'For safety, before overwriting your current data, ropa30 will automatically download a JSON backup of the current state.',
    restoreTestoConferma: 'You are about to restore content from the backup file. This REPLACES all current data and cannot be undone.',
    restoreRiepilogoTrattamenti: 'Processing activities in file:',
    restoreRiepilogoData: 'Backup created on:',
    restoreConferma: 'Restore (replace everything)',
    restoreAnnulla: 'Cancel',
    restoreSuccesso: 'Restore completed',
    restoreErroreFile: 'The selected file is not a valid ropa30 backup',
    restoreErroreRipristino: 'An error occurred during the restore. Your data was not modified.',
    printTitoloRegistro: 'Records of processing activities',
    printGeneratoIl: 'Generated on',
    exportRegistro: 'Export register',
    exportTitolo: 'Export the register',
    exportSottotitolo: 'Choose the document format to generate.',
    exportPdf: 'PDF',
    exportPdfDesc: 'For printing, archiving and exhibition.',
    exportXlsx: 'XLSX',
    exportXlsxDesc: 'For processing in Microsoft Excel.',
    exportOds: 'ODS',
    exportOdsDesc: 'For LibreOffice / OpenDocument.',
    exportChiudi: 'Close',
    exportFatto: 'Export completed',
    exportErrore: 'Error while exporting the register'
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

    art9: {
      consenso_esplicito: 'Explicit consent',
      obblighi_lavoro: 'Employment, social security and social protection obligations',
      interesse_vitale: 'Vital interests of the data subject',
      associazioni: 'Activities of a foundation, association or not-for-profit body',
      dati_resi_pubblici: 'Data manifestly made public by the data subject',
      giustizia: 'Establishment, exercise or defence of legal claims',
      interesse_pubblico: 'Reasons of substantial public interest',
      medicina_lavoro: 'Occupational medicine and assessment of working capacity',
      sanita_pubblica: 'Public interest in the area of public health',
      archiviazione: 'Archiving, scientific/historical research or statistical purposes'
    },
    fonteDeiDati: {
      interessato: 'Directly from the data subject',
      terzi: 'From third parties',
      fonti_pubbliche: 'From publicly accessible sources',
      misto: 'Mixed origin'
    },
    azioneFinale: {
      cancellazione: 'Erasure',
      anonimizzazione: 'Anonymisation',
      archiviazione: 'Archiving',
      cancellazione_o_anonimizzazione: 'Erasure or anonymisation'
    },
    garanziaTrasferimento: {
      decisione_adeguatezza: 'Adequacy decision (Art. 45)',
      scc: 'Standard contractual clauses \u2013 SCC (Art. 46)',
      bcr: 'Binding corporate rules \u2013 BCR (Art. 47)',
      codice_condotta: 'Approved code of conduct (Art. 46)',
      certificazione: 'Approved certification mechanism (Art. 46)',
      deroga_art49: 'Derogation for specific situations (Art. 49)',
      da_verificare: 'To be verified'
    },
    tipoRegistro: {
      titolare: 'Controller',
      responsabile: 'Processor'
    }
  },
  detail: {
    sezioni: {
      identificazione: 'Identification',
      finalita: 'Purposes',
      basiGiuridiche: 'Legal bases',
      condannePenali: 'Criminal convictions and offences',
      categorieInteressati: 'Categories of data subjects',
      categorieDati: 'Categories of data',
      destinatari: 'Recipients',
      trasferimenti: 'Transfers to third countries',
      conservazione: 'Retention',
      sicurezza: 'Security measures',
      automatizzati: 'Automated processing and profiling',
      dpiaNote: 'Impact assessment and notes'
    },
    campi: {
      // Sec. 1 — Identification
      nome: 'Processing activity name',
      descrizione: 'Description',
      tipoRegistro: 'Record type',
      dataInizioTrattamento: 'Processing start date',
      unitaOrganizzativa: 'Organizational units',
      uoUnita: 'Unit / Office',
      codiceUtente: 'Internal code',

      // Sec. 2 — Purposes
      finalita: 'Purposes of the processing',

      // Sec. 3 — Legal bases
      art6: 'Legal basis (Art. 6)',
      dettagliArt6: 'Legal basis details',
      liDescrizione: 'Description of the legitimate interest',
      liGaranzie: 'Safeguards adopted',
      liBilanciamentoEffettuato: 'Balancing test carried out',
      liBilanciamentoRichiesto: 'Balancing test required',
      liRiferimento: 'Reference to the balancing test',
      art9: 'Conditions for special categories (Art. 9)',
      dettagliArt9: 'Details on Art. 9 conditions',

      // Sec. 4 — Criminal convictions and offences (Art. 10)
      condanneePresenti: 'Processing of Art. 10 data',
      condanneNormativa: 'Law authorising the processing',

      // Sec. 5 — Categories of data subjects
      categorieInteressati: 'Categories of data subjects',

      // Sec. 6 — Categories of data
      categorieDati: 'Categories of personal data',
      fonteDeiDati: 'Source of the data',
      fonteDeiDatiDettagli: 'Details on the data source',

      // Sec. 7 — Recipients
      categorieDestinatari: 'Categories of recipients',
      responsabiliEsterni: 'Processors (external)',
      reDenominazione: 'Name',
      reSede: 'Registered office',
      reFinalita: 'Purpose of the entrusted processing',
      reAccordoArt28: 'Art. 28 agreement in place',
      reRiferimentoContratto: 'Contract reference',
      reNotaRuolo: 'Note on the privacy role',

      // Sec. 8 — Transfers to third countries
      trasferimentiExtraUE: 'Transfers to third countries',
      trPaese: 'Country / International organisation',
      trGaranzia: 'Safeguard applied',
      trRiferimento: 'Reference to documentation',

      // Sec. 9 — Retention
      conservazionePeriodo: 'Retention period',
      conservazioneCriteri: 'Criteria for determining the period',
      azioneFinale: 'Action at the end of retention',

      // Sec. 10 — Security measures
      misureTecniche: 'Technical measures',
      misureOrganizzative: 'Organisational measures',
      sicurezzaRinvio: 'Reference to security documentation',

      // Sec. 11 — Automated processing and profiling
      pdaPresenti: 'Automated decision-making present',
      pdaDescrizione: 'Description of the automated process',
      pdaLogica: 'Logic involved',
      pdaConseguenze: 'Envisaged consequences for the data subject',
      pdaDiritti: 'Rights of the data subject',
      profPresente: 'Marketing profiling present',
      profDescrizione: 'Description of the profiling',
      profLogica: 'Logic of the profiling',
      profBaseGiuridica: 'Specific legal basis for profiling',

      // Sec. 12 — DPIA and notes
      dpiaEffettuata: 'Data protection impact assessment carried out',
      dpiaRiferimento: 'Reference to the DPIA document',
      note: 'Notes'
    },
    stati: {
      vuoto: '\u2014',
      nonPresente: 'Not present',
      nonApplicabile: 'Not applicable',
      si: 'Yes',
      no: 'No'
    }
  }
};

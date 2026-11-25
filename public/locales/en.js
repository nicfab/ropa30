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
    footerGuidaLabel: 'Guide',
    footerGuidaUrl: 'https://codeberg.org/nicfab/ropa30/wiki/Home-en',
    btnAzioni: 'Actions',
    tabRegistroTitolare: 'Controller register',
    tabRegistroResponsabile: 'Processor register',
    azioniTitolo: 'Register actions',
    azioniSottotitolo: 'Backup, restore, export and controller details.',
    azioniChiudi: 'Close',

    welcomeTitolo: 'Records of processing activities',

    welcomeIntro: 'ropa30 lets you create, update and export the Records of processing activities required by Art. 30 GDPR, local-first and without sending data to external servers.',

    welcomePunto1: 'Structure compliant with Art. 30 of Regulation (EU) 2016/679',

    welcomePunto2: 'Local-first: no account, no cloud, data kept in your browser',

    welcomePunto3: 'Open source, with register export to PDF, XLSX and ODS',

    welcomePunto4: 'JSON backup to keep your data safe and restore it whenever you need',

    welcomeNotaLingua: 'The interface is in English because that’s your browser’s language. If you prefer another language, pick it from the drop-down menu at the top right: ropa30 will then always use it on this computer, even after you close and reopen the page.',

    welcomeNotaStorage: 'Your data stays saved in your browser. The browser may ask you to allow persistent storage: granting it helps reduce the risk of your data being removed automatically. In any case, export a JSON backup regularly to keep your register safe.',

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
    lblDenominazione: 'Name',
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
    onbObbligatorio: '* Required to save: name, city, country, email and at least one register language.',
    erroreEmail: 'Enter a valid email address.',
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
    btnEsporta: 'Full backup',
    backupAvviso: 'The full backup contains personal data and is not encrypted: keep it in a safe place, or use the \u201cEncrypted backup\u201d.',
    erroreBackup: 'The backup could not be exported. Please try again.',
    btnBackupCifrato: 'Encrypted backup',
    bcTitolo: 'Encrypted backup',
    bcTesto: 'The backup is encrypted in your browser (AES-256) with a password you choose. The file can only be restored with that password.',
    bcLblPassword: 'Password',
    bcLblConferma: 'Confirm password',
    bcMinimo: 'At least 12 characters. A phrase of several words is secure and easy to remember.',
    bcErroreCorta: 'The password must be at least 12 characters long.',
    bcErroreDiversa: 'The two passwords do not match.',
    bcAvvisoPerdita: 'The password is not stored anywhere and cannot be recovered: if you lose it, the backup cannot be restored.',
    bcLblCapito: 'I understand that without the password the backup cannot be recovered.',
    bcScarica: 'Encrypt and download',
    bcAnnulla: 'Cancel',
    bcErrore: 'The encrypted backup could not be created. Please try again.',
    rpTitolo: 'Encrypted backup',
    rpTesto: 'The selected file is an encrypted backup. Enter the password to open it.',
    rpLblPassword: 'Password',
    rpConferma: 'Open',
    rpAnnulla: 'Cancel',
    rpErrorePassword: 'Wrong password or damaged file. Your current data was not modified.',
    cryptoNonDisponibile: 'Encryption is not available in this browser. Use an up-to-date browser and open ropa30 over https://.',
    cercaPlaceholder: 'Search by name, purpose or legal basis\u2026',
    cercaAria: 'Search activities',
    contatoreUno: 'activity',
    contatoreMolti: 'activities',
    nessunRisultatoTitolo: 'No results',
    nessunRisultatoTesto: 'No activity matches your search. Try different terms.',
    btnPulisci: 'Clear',
    filtroUnitaLabel: 'Filter by organizational unit',
    filtroUnitaTutte: 'All units',
    tdTitolo: 'Controller details',
    tdTitoloResponsabile: 'Processor details',
    tdDenominazione: 'Name',
    tdFormaGiuridica: 'Legal form',
    tdCodiceFiscale: 'Tax code',
    tdPartitaIVA: 'VAT number',
    tdIndirizzo: 'Address',
    tdTelefono: 'Phone',
    tdEmail: 'Email',
    tdPec: 'Certified email (PEC)',
    tdSitoWeb: 'Website',
    tdDpoNome: 'DPO',
    tdDpoEmail: 'DPO email',
    tdDpoPec: 'DPO certified email (PEC)',
    estrattoTitolo: 'Extract from the Record of Processing Activities',
    estrattoUnita: 'Unit',
    sennaNome: '(untitled)',
    mancaEN: 'Missing EN',
    mancaIT: 'Missing IT',

    catalogoTitolo: 'Choose a template',
    catalogoSottotitolo: 'Pick a model to start from: it will be added to your register and you can customise it.',
    catalogoDisclaimer: 'Templates are carefully drafted starting points, but must be adapted to your context and verified. They do not constitute legal advice.',
    catalogoCercaPlaceholder: 'Search a template\u2026',
    catalogoCercaAria: 'Search templates',
    catalogoFiltroSettore: 'Filter templates by sector',
    catalogoSettoreTutti: 'All sectors',
    catalogoSettoreSoloComuni: 'For this sector, common templates are currently available. Sector-specific templates will be added progressively.',
    catalogoNessunRisultato: 'No template matches your search.',
    btnCrea: 'Add',
    btnChiudi: 'Close',
    dettaglioTornaLista: 'Back to the register',
    dettaglioModifica: 'Edit',
    dettaglioElimina: 'Delete',
    provCreato: 'Created on {data}',
    provModificato: 'Last modified on {data}',
    provTemplate: 'From template “{nome}”',
    provTemplateVersione: 'From template “{nome}”, version {v}',
    provTemplateVersioneData: 'From template “{nome}”, version {v} ({data})',
    provAggTitolo: 'An updated version of the template is available',
    provAggTesto: '“{nome}”: version {v}. This record has not been changed.',
    provAggTestoData: '“{nome}”: version {v} ({data}). This record has not been changed.',
    provAggNovita: 'What’s new:',
    provAggNota: 'Version {v} ({data}): {nota}',
    eliminaConfermaTitolo: 'Delete this activity?',
    azioniReset: 'Erase all data',
    resetConfermaTitolo: 'Erase all data?',
    resetConfermaTesto: 'You are about to delete all data stored in this browser: settings, processing activities and the activity log. This action cannot be undone.',
    resetConfermaNota: 'Before proceeding, we recommend downloading a JSON backup so you can restore the register later.',
    resetScaricaBackup: 'Download backup',
    resetAnnulla: 'Cancel',
    resetConferma: 'Erase all data',
    eliminaConfermaTesto: 'You are about to permanently delete this processing activity from the register. This action cannot be undone. The deletion is recorded in the activity log (audit).',
    eliminaConfermaNota: 'For an Article 30 Record, consider keeping ceased activities rather than deleting them.',
    eliminaConferma: 'Delete permanently',
    eliminaAnnulla: 'Cancel',
    eliminaFatto: 'Activity deleted',
    eliminaErrore: 'Error while deleting',
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
    printSuffissoTitolare: ' — Controller (Art. 30(1))',
    printSuffissoResponsabile: ' — Processor (Art. 30(2))',
    printGeneratoIl: 'Generated on',
    exportRegistro: 'Export register',
    exportTitolo: 'Export the register',
    exportSottotitolo: 'Choose the document format to generate.',
    exportPdf: 'PDF',
    exportPdfDesc: 'For printing, retention and submission.',
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
    settore: {
      comune: 'General',
      pa: 'Public Administration',
      universita: 'University',
      caf: 'Tax assistance centre (CAF)',
      studi_legali: 'Law firms',
      sanita: 'Healthcare / Medical practices',
      scuole: 'Schools',
      commercialisti_consulenti_lavoro: 'Accountants / Labour consultants',
      terzo_settore: 'Non-profit / Associations',
      condomini: 'Condominiums / Property managers',
      ecommerce_retail: 'E-commerce / Retail',
      assicurazioni: 'Insurance / Brokers',
      immobiliare: 'Real estate / Agencies',
      it_provider: 'IT providers / Software houses',
      hospitality: 'Hospitality / Accommodation'
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
      titolariPerContoDelQuale: 'Controllers on whose behalf the processor acts (Art. 30(2)(a))',
      tcDenominazione: 'Name of the controller',
      tcContatti: 'Controller\u2019s contact details',
      tcRappresentante: 'Controller\u2019s representative (Art. 27), where designated',
      tcDpo: 'Controller\u2019s data protection officer, where designated',
      tcRiferimentoContratto: 'Reference to the contract or other legal act (Art. 28(3))',
      contitolari: 'Joint controllers (Art. 30(1)(a))',
      ctDenominazione: 'Name of the joint controller',
      ctContatti: 'Contact details',
      ctRiferimentoAccordo: 'Reference to the arrangement (Art. 26)',
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
  },

  // ---- Contextual GDPR guidance in the editor (EN) ----
  // Keys: control key; sub-fields of repeatable groups: '<group>.<key>'.
  // Fields without an entry show no guidance button.
  guida: {
    _pulsante: 'Help',
    nome: 'Give the processing activity a short, recognisable name that indicates what it is, for example "Personnel management" or "Customer newsletter". In the processor\u2019s record the name indicates the category of processing carried out on behalf of the controller (Art. 30(2)(b)).',
    descrizione: 'Describe in a few lines what the processing consists of: which operations are carried out, with which tools and in which context. A clear description makes the record understandable to the supervisory authority, to which it must be made available on request (Art. 30(4)).',
    tipoRegistro: 'Choose "Controller" if you determine the purposes and means of the processing (Art. 4(7)); choose "Processor" if you process the data on behalf of a controller (Art. 4(8)). The two records have different contents (Art. 30(1) and (2)), and the editor fields adapt to your choice.',
    contitolari: 'Fill in only if you determine the purposes and means of this processing jointly with other controllers (Art. 26). Give the name and contact details of each joint controller (Art. 30(1)(a)).',
    'contitolari.riferimentoAccordo': 'The arrangement between joint controllers sets out their respective responsibilities, in particular for the exercise of data subjects\u2019 rights and for the information to be provided to them. Its essence must be made available to the data subject (Art. 26(1) and (2)).',
    titolariPerContoDelQuale: 'List each controller on whose behalf you carry out the processing, with name and contact details and, where designated, its representative (Art. 27) and its data protection officer (Art. 30(2)(a)).',
    'titolariPerContoDelQuale.riferimentoContratto': 'Processing by a processor is governed by a contract or other legal act that binds it to the controller and sets out the controller\u2019s instructions (Art. 28(3)). Give its details, for example date and subject matter.',
    dataInizioTrattamento: 'Optional. The date from which the processing has been carried out: it helps to trace the history of the record and to check, for example, retention periods.',
    unitaOrganizzativa: 'Optional. The office or department that carries out the processing; if it is shared between several units, add one for each. It allows you to filter the record and export an extract per unit.',
    codiceUtente: 'Optional. A free code, for example "HR-01", to link the processing activity to other documentation of the organisation.',
    finalita: 'State the specified, explicit and legitimate purposes for which you process the data (Art. 5(1)(b)). One purpose per line, worded specifically: not "data management" but "payroll processing". This is mandatory content of the controller\u2019s record (Art. 30(1)(b)).',
    art6: 'Select the condition for lawfulness on which the processing is based (Art. 6(1)). It is not required by Art. 30, but documenting it helps to demonstrate compliance with the lawfulness principle (Art. 5(1)(a) and (2)). If different purposes have different bases, explain this in the details.',
    dettagliArt6: 'Specify the actual ground: for a legal obligation or a task in the public interest, the relevant legal provision (Art. 6(3)); for a contract, the type of relationship; for consent, how it is obtained and recorded (Art. 7(1)).',
    liDescrizione: 'Only if the legal basis is legitimate interests (Art. 6(1)(f)). Describe the interest pursued by the controller or by a third party, which must be lawful, clearly articulated and real. This basis does not apply to processing carried out by public authorities in the performance of their tasks.',
    liGaranzie: 'The measures taken to reduce the impact on data subjects so that the legitimate interest prevails, for example data minimisation, pseudonymisation or an easy way to object (Art. 21).',
    liBilanciamentoEffettuato: 'State whether you have documented the balancing between the legitimate interest and the interests or fundamental rights and freedoms of data subjects, taking into account their reasonable expectations (Recital 47).',
    liBilanciamentoRichiesto: 'Indicate whether a balancing test is needed for this processing. When the legal basis is legitimate interests, the test is used to demonstrate that the interests or rights of data subjects do not override that interest. The test is also known as a Legitimate Interests Assessment (LIA).',
    liRiferimento: 'The details of the document in which the test is recorded, for example title, date and version, so that it can be produced on request (Art. 5(2)).',
    art9: 'Fill in only if you process special categories of data: data concerning health, genetic or biometric data, racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, sex life or sexual orientation. Processing them is prohibited unless one of the conditions in Art. 9(2) applies, to be indicated in addition to the legal basis under Art. 6.',
    dettagliArt9: 'Specify the ground for the chosen condition: for example the Union or Member State law that authorises the processing (Art. 9(2)(b), (g), (h), (i)), or how explicit consent is obtained (point (a)). In Italy, for processing necessary for reasons of substantial public interest (point (g)), see also Article 2-sexies of the Personal Data Protection Code (Legislative Decree 196/2003).'
  }
};

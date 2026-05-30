/*
 * ropa30 — locales/it.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Italian interface strings (i18n). This file holds ONLY UI text and the
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
    appTitle: 'ropa30 — Il registro dei trattamenti GDPR, semplice.',
    appDescription: 'Il registro delle attività di trattamento ex art. 30 GDPR, semplice e gratuito.',
    langSwitcherLabel: 'Lingua',
    skipToContent: 'Vai al contenuto principale',
    brandTagline: 'Il registro dei trattamenti GDPR, semplice.',
    footerLicense: 'Rilasciato sotto AGPL-3.0-or-later',
    footerAuthor: 'Realizzato da',
    footerRepoLabel: 'Codice e segnalazioni',
    footerEmailLabel: 'Email',
    footerRepoAria: 'Codice sorgente e segnalazioni su Codeberg (apre una nuova scheda)',
    footerEmailAria: 'Scrivi un\x27email di supporto',
    footerGuidaLabel: 'Guida',
    footerGuidaUrl: 'https://codeberg.org/nicfab/ropa30/wiki/Home',
    btnAzioni: 'Azioni',
    tabRegistroTitolare: 'Registro del titolare',
    tabRegistroResponsabile: 'Registro del responsabile',
    azioniTitolo: 'Azioni sul registro',
    azioniSottotitolo: 'Backup, ripristino, esportazione e dati del titolare.',
    azioniChiudi: 'Chiudi',

    welcomeTitolo: 'Registro delle attività di trattamento',

    welcomeIntro: 'ropa30 consente di creare, aggiornare ed esportare il Registro delle attività di trattamento previsto dall’art. 30 GDPR, in modalità local-first e senza inviare dati a server esterni.',

    welcomePunto1: 'Struttura conforme all’art. 30 del Regolamento (UE) 2016/679',

    welcomePunto2: 'Local-first: nessun account, nessun cloud, dati conservati nel browser',

    welcomePunto3: 'Open source e con export del registro in PDF, XLSX e ODS',

    welcomePunto4: 'Backup in formato JSON per conservare i tuoi dati e ripristinarli quando vuoi',

    welcomeNotaStorage: 'I dati restano salvati nel tuo browser. Il browser potrebbe chiederti di consentire l\u2019archiviazione persistente: concederla aiuta a ridurre il rischio che i dati vengano rimossi automaticamente. In ogni caso, esporta regolarmente un backup JSON per conservare il registro al sicuro.',

    welcomeComeIniziare: 'Come vuoi iniziare?',

    welcomeImportTitolo: 'Ho già un backup',

    welcomeImportTesto: 'Importa un file JSON di backup e ripristina un registro già creato.',

    welcomeImportBtn: 'Importa backup',

    welcomeNuovoTitolo: 'Inizia da zero',

    welcomeNuovoTesto: 'Configura il registro inserendo i dati del titolare del trattamento.',

    welcomeNuovoBtn: 'Inizia',

    welcomeNota: 'Per iniziare da zero sono necessari almeno: denominazione del titolare, lingua del registro e sede del titolare.',

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
    lblLingueRegistro: 'Lingue del registro',
    lblLinguaPrincipale: 'Lingua principale',
    lblDataCreazione: 'Data di creazione',
    hintLingueRegistro: 'Scegli in quali lingue redigere il registro. Puoi abilitarne una o entrambe; la lingua principale \u00e8 quella usata per impostazione predefinita.',
    erroreNessunaLingua: 'Seleziona almeno una lingua per il registro.',
    onbObbligatorio: '* Campi obbligatori per salvare: denominazione, almeno una lingua del registro e la sede del titolare (città e Stato).',
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
    btnEsporta: 'Backup completo',
    backupAvviso: 'Il file contiene dati personali e non \u00e8 cifrato. Conservalo in un luogo sicuro.',
    erroreBackup: 'Non \u00e8 stato possibile esportare il backup. Riprova.',
    cercaPlaceholder: 'Cerca per nome, finalit\u00e0 o base giuridica\u2026',
    cercaAria: 'Cerca tra i trattamenti',
    contatoreUno: 'trattamento',
    contatoreMolti: 'trattamenti',
    nessunRisultatoTitolo: 'Nessun risultato',
    nessunRisultatoTesto: 'Nessun trattamento corrisponde alla ricerca. Prova con altri termini.',
    btnPulisci: 'Pulisci',
    filtroUnitaLabel: 'Filtra per unit\xE0 organizzativa',
    filtroUnitaTutte: 'Tutte le unit\xE0',
    tdTitolo: 'Dati del titolare',
    tdTitoloResponsabile: 'Dati del responsabile',
    tdDenominazione: 'Denominazione',
    tdFormaGiuridica: 'Forma giuridica',
    tdCodiceFiscale: 'Codice fiscale',
    tdPartitaIVA: 'Partita IVA',
    tdIndirizzo: 'Indirizzo',
    tdTelefono: 'Telefono',
    tdEmail: 'Email',
    tdPec: 'PEC',
    tdSitoWeb: 'Sito web',
    tdDpoNome: 'DPO',
    tdDpoEmail: 'Email DPO',
    tdDpoPec: 'PEC DPO',
    estrattoTitolo: 'Estratto del Registro delle attivit\xE0 di trattamento',
    estrattoUnita: 'Unit\xE0',
    sennaNome: '(senza nome)',
    mancaEN: 'Manca EN',
    mancaIT: 'Manca IT',

    catalogoTitolo: 'Scegli un template',
    catalogoSottotitolo: 'Seleziona un modello da cui partire: verr\u00e0 aggiunto al registro e potrai personalizzarlo.',
    catalogoDisclaimer: 'I template sono punti di partenza redatti con cura, ma vanno adattati alla tua realt\u00e0 e verificati. Non costituiscono consulenza legale.',
    catalogoCercaPlaceholder: 'Cerca un template\u2026',
    catalogoCercaAria: 'Cerca tra i template',
    catalogoFiltroSettore: 'Filtra i template per settore',
    catalogoSettoreTutti: 'Tutti i settori',
    catalogoSettoreSoloComuni: 'Per questo settore sono attualmente disponibili i template comuni. I template specifici saranno aggiunti progressivamente.',
    catalogoNessunRisultato: 'Nessun template corrisponde alla ricerca.',
    btnCrea: 'Aggiungi',
    btnChiudi: 'Chiudi',
    dettaglioTornaLista: 'Torna al registro',
    dettaglioModifica: 'Modifica',
    dettaglioElimina: 'Elimina',
    eliminaConfermaTitolo: 'Eliminare questo trattamento?',
    azioniReset: 'Svuota tutti i dati',
    resetConfermaTitolo: 'Svuotare tutti i dati?',
    resetConfermaTesto: 'Stai per eliminare tutti i dati salvati in questo browser: impostazioni, trattamenti e registro attività. L\u2019operazione non può essere annullata.',
    resetConfermaNota: 'Prima di procedere, ti consigliamo di scaricare un backup JSON, così potrai ripristinare il registro in seguito.',
    resetScaricaBackup: 'Scarica backup',
    resetAnnulla: 'Annulla',
    resetConferma: 'Svuota tutti i dati',
    eliminaConfermaTesto: 'Stai per eliminare definitivamente questo trattamento dal registro. L\u2019operazione non pu\xF2 essere annullata. L\u2019eliminazione viene registrata nel log delle attivit\xE0 (audit).',
    eliminaConfermaNota: 'Per un Registro ex art. 30 valuta se conservare i trattamenti cessati anzich\xE9 eliminarli.',
    eliminaConferma: 'Elimina definitivamente',
    eliminaAnnulla: 'Annulla',
    eliminaFatto: 'Trattamento eliminato',
    eliminaErrore: 'Errore durante l\u2019eliminazione',
    editorTitolo: 'Modifica trattamento',
    editorSalva: 'Salva',
    editorAnnulla: 'Annulla',
    editorErroreSalva: 'Si \u00e8 verificato un errore durante il salvataggio. Riprova.',
    editorNomeMancante: 'La denominazione \u00e8 obbligatoria nella lingua principale del registro.',
    editorAggiungiVoce: 'Aggiungi voce',
    editorAggiungiElemento: 'Aggiungi elemento',
    editorRimuovi: 'Rimuovi',
    editorVuoto: 'Nessun elemento. Usa \u201cAggiungi elemento\u201d per inserirne uno.',
    editorConfermaTitolo: 'Modifiche non salvate',
    editorConfermaTesto: 'Hai modifiche non salvate. Vuoi davvero uscire senza salvare?',
    editorConfermaEsci: 'Esci senza salvare',
    editorConfermaResta: 'Continua a modificare',
    editorColonnaIt: 'Italiano',
    editorColonnaEn: 'English',
    editorEspandiTutto: 'Espandi tutto',
    editorComprimiTutto: 'Comprimi tutto',
    restoreImporta: 'Importa / Ripristina',
    restoreTitoloConferma: 'Confermi il ripristino?',
    restoreDisclaimerBackup: 'Per sicurezza, prima di sovrascrivere i dati attuali, ropa30 scaricherà automaticamente un backup JSON dello stato corrente.',
    restoreTestoConferma: 'Stai per ripristinare il contenuto dal file di backup. Questa operazione SOSTITUISCE tutti i dati attuali ed è irreversibile.',
    restoreRiepilogoTrattamenti: 'Trattamenti nel file:',
    restoreRiepilogoData: 'Backup creato il:',
    restoreConferma: 'Ripristina (sostituisci tutto)',
    restoreAnnulla: 'Annulla',
    restoreSuccesso: 'Ripristino completato',
    restoreErroreFile: 'Il file selezionato non è un backup valido di ropa30',
    restoreErroreRipristino: 'Si è verificato un errore durante il ripristino. I dati non sono stati modificati.',
    printTitoloRegistro: 'Registro delle attività di trattamento',
    printSuffissoTitolare: ' — Titolare (art. 30(1))',
    printSuffissoResponsabile: ' — Responsabile (art. 30(2))',
    printGeneratoIl: 'Generato il',
    exportRegistro: 'Esporta registro',
    exportTitolo: 'Esporta il registro',
    exportSottotitolo: 'Scegli il formato del documento da generare.',
    exportPdf: 'PDF',
    exportPdfDesc: 'Per stampa, conservazione ed esibizione.',
    exportXlsx: 'XLSX',
    exportXlsxDesc: 'Per elaborazione in Microsoft Excel.',
    exportOds: 'ODS',
    exportOdsDesc: 'Per LibreOffice / OpenDocument.',
    exportChiudi: 'Chiudi',
    exportFatto: 'Export completato',
    exportErrore: 'Errore durante l’export del registro'
  },

  enums: {
    categoria: {
      marketing: 'Marketing',
      risorse_umane: 'Risorse umane',
      sicurezza: 'Sicurezza',
      clientela: 'Clientela',
      fornitori: 'Fornitori',
      amministrazione: 'Amministrazione',
      legale: 'Legale',
      web: 'Web'
    },
    settore: {
      comune: 'Generale',
      pa: 'Pubblica Amministrazione',
      universita: 'Universit\xE0',
      caf: 'CAF / Assistenza fiscale',
      studi_legali: 'Studi legali',
      sanita: 'Sanit\xE0 / Studi medici',
      scuole: 'Scuole / Istituti scolastici',
      commercialisti_consulenti_lavoro: 'Commercialisti / Consulenti del lavoro',
      terzo_settore: 'Terzo Settore / Associazioni',
      condomini: 'Condomini / Amministratori',
      ecommerce_retail: 'E-commerce / Retail',
      assicurazioni: 'Assicurazioni / Intermediari',
      immobiliare: 'Immobiliare / Agenzie',
      it_provider: 'IT provider / Software house',
      hospitality: 'Strutture ricettive / Hospitality'
    },
    art6: {
      consenso: 'Consenso',
      contratto: 'Contratto',
      obbligo_legale: 'Obbligo legale',
      interesse_vitale: 'Interesse vitale',
      interesse_pubblico: 'Interesse pubblico',
      legittimo_interesse: 'Legittimo interesse'
    },

    art9: {
      consenso_esplicito: 'Consenso esplicito',
      obblighi_lavoro: 'Obblighi in materia di diritto del lavoro e sicurezza sociale',
      interesse_vitale: 'Interesse vitale dell\u2019interessato',
      associazioni: 'Attivit\u00e0 di fondazioni, associazioni o organismi senza scopo di lucro',
      dati_resi_pubblici: 'Dati resi manifestamente pubblici dall\u2019interessato',
      giustizia: 'Accertamento, esercizio o difesa di un diritto in sede giudiziaria',
      interesse_pubblico: 'Motivi di interesse pubblico rilevante',
      medicina_lavoro: 'Medicina del lavoro e valutazione della capacit\u00e0 lavorativa',
      sanita_pubblica: 'Interesse pubblico nel settore della sanit\u00e0 pubblica',
      archiviazione: 'Archiviazione, ricerca scientifica/storica o fini statistici'
    },
    fonteDeiDati: {
      interessato: 'Direttamente dall\u2019interessato',
      terzi: 'Da soggetti terzi',
      fonti_pubbliche: 'Da fonti accessibili al pubblico',
      misto: 'Origine mista'
    },
    azioneFinale: {
      cancellazione: 'Cancellazione',
      anonimizzazione: 'Anonimizzazione',
      archiviazione: 'Archiviazione',
      cancellazione_o_anonimizzazione: 'Cancellazione o anonimizzazione'
    },
    garanziaTrasferimento: {
      decisione_adeguatezza: 'Decisione di adeguatezza (art. 45)',
      scc: 'Clausole contrattuali tipo \u2013 SCC (art. 46)',
      bcr: 'Norme vincolanti d\u2019impresa \u2013 BCR (art. 47)',
      codice_condotta: 'Codice di condotta approvato (art. 46)',
      certificazione: 'Meccanismo di certificazione approvato (art. 46)',
      deroga_art49: 'Deroga per situazioni specifiche (art. 49)',
      da_verificare: 'Da verificare'
    },
    tipoRegistro: {
      titolare: 'Titolare del trattamento',
      responsabile: 'Responsabile del trattamento'
    }
  },
  detail: {
    sezioni: {
      identificazione: 'Identificazione',
      finalita: 'Finalit\u00e0',
      basiGiuridiche: 'Basi giuridiche',
      condannePenali: 'Condanne penali e reati',
      categorieInteressati: 'Categorie di interessati',
      categorieDati: 'Categorie di dati',
      destinatari: 'Destinatari',
      trasferimenti: 'Trasferimenti verso Paesi terzi',
      conservazione: 'Conservazione',
      sicurezza: 'Misure di sicurezza',
      automatizzati: 'Processi automatizzati e profilazione',
      dpiaNote: 'Valutazione d\u2019impatto e note'
    },
    campi: {
      // Sez. 1 — Identificazione
      nome: 'Denominazione del trattamento',
      descrizione: 'Descrizione',
      tipoRegistro: 'Tipo di registro',
      dataInizioTrattamento: 'Data di inizio del trattamento',
      unitaOrganizzativa: 'Unit\xE0 organizzative',
      uoUnita: 'Unit\xE0 / Ufficio',
      codiceUtente: 'Codice interno',

      // Sez. 2 — Finalit\u00e0
      finalita: 'Finalit\u00e0 del trattamento',

      // Sez. 3 — Basi giuridiche
      art6: 'Base giuridica (art. 6)',
      dettagliArt6: 'Dettagli sulla base giuridica',
      liDescrizione: 'Descrizione del legittimo interesse',
      liGaranzie: 'Garanzie adottate',
      liBilanciamentoEffettuato: 'Test di bilanciamento effettuato',
      liBilanciamentoRichiesto: 'Test di bilanciamento richiesto',
      liRiferimento: 'Riferimento al test di bilanciamento',
      art9: 'Condizioni per categorie particolari (art. 9)',
      dettagliArt9: 'Dettagli sulle condizioni ex art. 9',

      // Sez. 4 — Condanne penali e reati (art. 10)
      condanneePresenti: 'Trattamento di dati ex art. 10',
      condanneNormativa: 'Normativa che autorizza il trattamento',

      // Sez. 5 — Categorie di interessati
      categorieInteressati: 'Categorie di interessati',

      // Sez. 6 — Categorie di dati
      categorieDati: 'Categorie di dati personali',
      fonteDeiDati: 'Fonte dei dati',
      fonteDeiDatiDettagli: 'Dettagli sulla fonte dei dati',

      // Sez. 7 — Destinatari
      categorieDestinatari: 'Categorie di destinatari',
      responsabiliEsterni: 'Responsabili del trattamento (esterni)',
      reDenominazione: 'Denominazione',
      titolariPerContoDelQuale: 'Titolari per conto dei quali si agisce (art. 30(2)(a))',
      tcDenominazione: 'Denominazione del titolare',
      tcContatti: 'Contatti',
      tcRuolo: 'Ruolo',
      reSede: 'Sede',
      reFinalita: 'Finalit\u00e0 del trattamento affidato',
      reAccordoArt28: 'Accordo ex art. 28 presente',
      reRiferimentoContratto: 'Riferimento contrattuale',
      reNotaRuolo: 'Nota sul ruolo privacy',

      // Sez. 8 — Trasferimenti verso Paesi terzi
      trasferimentiExtraUE: 'Trasferimenti verso Paesi terzi',
      trPaese: 'Paese / Organizzazione internazionale',
      trGaranzia: 'Garanzia applicata',
      trRiferimento: 'Riferimento alla documentazione',

      // Sez. 9 — Conservazione
      conservazionePeriodo: 'Periodo di conservazione',
      conservazioneCriteri: 'Criteri di determinazione del periodo',
      azioneFinale: 'Azione al termine della conservazione',

      // Sez. 10 — Misure di sicurezza
      misureTecniche: 'Misure tecniche',
      misureOrganizzative: 'Misure organizzative',
      sicurezzaRinvio: 'Rinvio a documentazione sulla sicurezza',

      // Sez. 11 — Processi automatizzati e profilazione
      pdaPresenti: 'Processo decisionale automatizzato presente',
      pdaDescrizione: 'Descrizione del processo automatizzato',
      pdaLogica: 'Logica utilizzata',
      pdaConseguenze: 'Conseguenze previste per l\u2019interessato',
      pdaDiritti: 'Diritti dell\u2019interessato',
      profPresente: 'Profilazione per marketing presente',
      profDescrizione: 'Descrizione della profilazione',
      profLogica: 'Logica della profilazione',
      profBaseGiuridica: 'Base giuridica specifica della profilazione',

      // Sez. 12 — DPIA e note
      dpiaEffettuata: 'Valutazione d\u2019impatto effettuata',
      dpiaRiferimento: 'Riferimento al documento di DPIA',
      note: 'Note'
    },
    stati: {
      vuoto: '\u2014',
      nonPresente: 'Non presente',
      nonApplicabile: 'Non applicabile',
      si: 'S\u00ec',
      no: 'No'
    }
  }
};

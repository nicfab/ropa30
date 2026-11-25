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

    welcomeNotaLingua: 'L’interfaccia è in italiano perché è la lingua impostata nel tuo browser. Se preferisci un’altra lingua, puoi selezionarla dal menu a tendina in alto a destra: da quel momento ropa30 la userà sempre su questo computer, anche se chiudi e riapri la pagina.',

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
    lblDenominazione: 'Denominazione',
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
    onbObbligatorio: '* Campi obbligatori per salvare: denominazione, città, Paese, email e almeno una lingua del registro.',
    erroreEmail: 'Inserisci un indirizzo email valido.',
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
    backupAvviso: 'Il backup completo contiene dati personali e non \u00e8 cifrato: conservalo in un luogo sicuro, oppure usa il \u00abBackup cifrato\u00bb.',
    erroreBackup: 'Non \u00e8 stato possibile esportare il backup. Riprova.',
    btnBackupCifrato: 'Backup cifrato',
    bcTitolo: 'Backup cifrato',
    bcTesto: 'Il backup viene cifrato nel tuo browser (AES-256) con una password che scegli tu. Il file potr\u00e0 essere ripristinato solo con quella password.',
    bcLblPassword: 'Password',
    bcLblConferma: 'Conferma password',
    bcMinimo: 'Almeno 12 caratteri. Una frase di pi\u00f9 parole \u00e8 sicura e facile da ricordare.',
    bcErroreCorta: 'La password deve avere almeno 12 caratteri.',
    bcErroreDiversa: 'Le due password non coincidono.',
    bcAvvisoPerdita: 'La password non viene salvata da nessuna parte e non pu\u00f2 essere recuperata: se la perdi, il backup non potr\u00e0 essere ripristinato.',
    bcLblCapito: 'Ho capito che senza la password il backup non \u00e8 recuperabile.',
    bcScarica: 'Cifra e scarica',
    bcAnnulla: 'Annulla',
    bcErrore: 'Non \u00e8 stato possibile creare il backup cifrato. Riprova.',
    rpTitolo: 'Backup cifrato',
    rpTesto: 'Il file selezionato \u00e8 un backup cifrato. Inserisci la password per aprirlo.',
    rpLblPassword: 'Password',
    rpConferma: 'Apri',
    rpAnnulla: 'Annulla',
    rpErrorePassword: 'Password errata o file danneggiato. I dati attuali non sono stati modificati.',
    cryptoNonDisponibile: 'La cifratura non \u00e8 disponibile in questo browser. Usa un browser aggiornato e apri ropa30 tramite https://.',
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
    provCreato: 'Creato il {data}',
    provModificato: 'Ultima modifica il {data}',
    provTemplate: 'Da template «{nome}»',
    provTemplateVersione: 'Da template «{nome}», versione {v}',
    provTemplateVersioneData: 'Da template «{nome}», versione {v} del {data}',
    provAggTitolo: 'È disponibile una versione aggiornata del template',
    provAggTesto: '«{nome}»: versione {v}. Il trattamento non è stato modificato.',
    provAggTestoData: '«{nome}»: versione {v} del {data}. Il trattamento non è stato modificato.',
    provAggNovita: 'Novità:',
    provAggNota: 'Versione {v} ({data}): {nota}',
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
      tcContatti: 'Dati di contatto del titolare',
      tcRappresentante: 'Rappresentante del titolare (art. 27), ove designato',
      tcDpo: 'Responsabile della protezione dei dati del titolare, ove designato',
      tcRiferimentoContratto: 'Riferimento al contratto o altro atto giuridico (art. 28(3))',
      contitolari: 'Contitolari del trattamento (art. 30(1)(a))',
      ctDenominazione: 'Denominazione del contitolare',
      ctContatti: 'Dati di contatto',
      ctRiferimentoAccordo: 'Riferimento all\u2019accordo (art. 26)',
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
  },

  // ---- Contextual GDPR guidance in the editor (IT) ----
  // Keys: control key; sub-fields of repeatable groups: '<group>.<key>'.
  // Fields without an entry show no guidance button.
  guida: {
    _pulsante: 'Guida',
    nome: 'Dai al trattamento un nome breve e riconoscibile, che ne indichi l\u2019attivit\u00e0, per esempio \u00abGestione del personale\u00bb o \u00abNewsletter ai clienti\u00bb. Nel registro del responsabile il nome indica la categoria di trattamenti svolti per conto del titolare (art. 30, par. 2, lett. b).',
    descrizione: 'Descrivi in poche righe in che cosa consiste il trattamento: quali operazioni si svolgono, con quali strumenti e in quale contesto. Una descrizione chiara rende il registro comprensibile all\u2019autorit\u00e0 di controllo, a cui va messo a disposizione su richiesta (art. 30, par. 4).',
    tipoRegistro: 'Scegli \u00abTitolare\u00bb se determini tu le finalit\u00e0 e i mezzi del trattamento (art. 4, n. 7); scegli \u00abResponsabile\u00bb se tratti i dati per conto di un titolare (art. 4, n. 8). I due registri hanno contenuti diversi (art. 30, par. 1 e par. 2), e i campi dell\u2019editor si adattano alla scelta.',
    contitolari: 'Compila solo se determini le finalit\u00e0 e i mezzi di questo trattamento insieme ad altri titolari (art. 26). Indica il nome e i dati di contatto di ciascun contitolare (art. 30, par. 1, lett. a).',
    'contitolari.riferimentoAccordo': 'L\u2019accordo interno tra contitolari stabilisce le rispettive responsabilit\u00e0, in particolare per l\u2019esercizio dei diritti degli interessati e per le informazioni da fornire loro. Il suo contenuto essenziale va messo a disposizione dell\u2019interessato (art. 26, par. 1 e 2).',
    titolariPerContoDelQuale: 'Indica ogni titolare per conto del quale svolgi il trattamento, con il nome e i dati di contatto e, ove designati, il suo rappresentante (art. 27) e il suo responsabile della protezione dei dati (art. 30, par. 2, lett. a).',
    'titolariPerContoDelQuale.riferimentoContratto': 'Il trattamento da parte del responsabile \u00e8 disciplinato da un contratto o da altro atto giuridico che lo vincola al titolare e ne fissa le istruzioni (art. 28, par. 3). Indicane gli estremi, per esempio la data e l\u2019oggetto.',
    dataInizioTrattamento: 'Facoltativo. La data da cui il trattamento \u00e8 in corso: aiuta a ricostruire la storia del registro e a verificare, per esempio, i tempi di conservazione.',
    unitaOrganizzativa: 'Facoltativo. L\u2019ufficio o il reparto che svolge il trattamento; se il trattamento \u00e8 condiviso tra pi\u00f9 unit\u00e0, aggiungine una per ciascuna. Permette di filtrare il registro e di esportarne un estratto per unit\u00e0.',
    codiceUtente: 'Facoltativo. Un codice libero, per esempio \u00abHR-01\u00bb, per collegare il trattamento ad altra documentazione dell\u2019organizzazione.',
    finalita: 'Indica gli scopi determinati, espliciti e legittimi per cui tratti i dati (art. 5, par. 1, lett. b). Una finalit\u00e0 per riga, formulata in modo specifico: non \u00abgestione dei dati\u00bb, ma \u00abelaborazione delle buste paga\u00bb. \u00c8 contenuto obbligatorio del registro del titolare (art. 30, par. 1, lett. b).',
    art6: 'Seleziona la condizione di liceit\u00e0 su cui si fonda il trattamento (art. 6, par. 1). Non \u00e8 un contenuto richiesto dall\u2019art. 30, ma documentarla aiuta a dimostrare il rispetto del principio di liceit\u00e0 (art. 5, par. 1, lett. a, e par. 2). Se finalit\u00e0 diverse hanno basi diverse, indicalo nei dettagli.',
    dettagliArt6: 'Specifica il fondamento concreto: per l\u2019obbligo legale o il compito di interesse pubblico, la norma di riferimento (art. 6, par. 3); per il contratto, il tipo di rapporto; per il consenso, come viene raccolto e documentato (art. 7, par. 1).',
    liDescrizione: 'Solo se la base giuridica \u00e8 il legittimo interesse (art. 6, par. 1, lett. f). Descrivi l\u2019interesse perseguito dal titolare o da terzi, che deve essere lecito, chiaro e reale. Questa base non si applica ai trattamenti svolti dalle autorit\u00e0 pubbliche nell\u2019esecuzione dei loro compiti.',
    liGaranzie: 'Le misure adottate per ridurre l\u2019impatto sugli interessati e far prevalere il legittimo interesse, per esempio la minimizzazione dei dati, la pseudonimizzazione o la possibilit\u00e0 di opporsi facilmente (art. 21).',
    liBilanciamentoEffettuato: 'Indica se hai documentato il bilanciamento tra il legittimo interesse e gli interessi o i diritti e le libert\u00e0 fondamentali degli interessati, tenendo conto delle loro ragionevoli aspettative (considerando 47).',
    liBilanciamentoRichiesto: 'Segnala se per questo trattamento va svolto il test di bilanciamento. Quando la base giuridica \u00e8 il legittimo interesse, il test serve a dimostrare che su quell\u2019interesse non prevalgono gli interessi o i diritti degli interessati. Il test \u00e8 noto anche come LIA (Legitimate Interests Assessment).',
    liRiferimento: 'Gli estremi del documento in cui \u00e8 registrato il test, per esempio titolo, data e versione, cos\u00ec da poterlo esibire su richiesta (art. 5, par. 2).',
    art9: 'Compila solo se tratti categorie particolari di dati: dati relativi alla salute, dati genetici o biometrici, origine razziale o etnica, opinioni politiche, convinzioni religiose o filosofiche, appartenenza sindacale, vita o orientamento sessuale. Il loro trattamento \u00e8 vietato salvo che ricorra una delle condizioni dell\u2019art. 9, par. 2, da indicare in aggiunta alla base giuridica dell\u2019art. 6.',
    dettagliArt9: 'Specifica il fondamento della condizione scelta: per esempio la norma del diritto dell\u2019Unione o nazionale che autorizza il trattamento (art. 9, par. 2, lett. b, g, h, i), oppure le modalit\u00e0 con cui viene raccolto il consenso esplicito (lett. a). In Italia, per i trattamenti necessari per motivi di interesse pubblico rilevante (lett. g), rileva anche l\u2019art. 2-sexies del Codice in materia di protezione dei dati personali (d.lgs. 196/2003).',
    condanneePresenti: 'Indica se il trattamento riguarda dati personali relativi a condanne penali e reati o a connesse misure di sicurezza. Questi dati possono essere trattati solo sotto il controllo dell\u2019autorit\u00e0 pubblica, oppure se il trattamento \u00e8 autorizzato dal diritto dell\u2019Unione o degli Stati membri che preveda garanzie appropriate (art. 10).',
    condanneNormativa: 'Indica la norma del diritto dell\u2019Unione o nazionale che autorizza il trattamento e ne prevede le garanzie (art. 10). In Italia rileva l\u2019art. 2-octies del Codice in materia di protezione dei dati personali (d.lgs. 196/2003).',
    categorieInteressati: 'Descrivi le categorie di persone fisiche a cui si riferiscono i dati, per esempio \u00abdipendenti\u00bb, \u00abcandidati\u00bb, \u00abclienti\u00bb, \u00abvisitatori del sito web\u00bb. Una categoria per riga; segnala anche la presenza di soggetti vulnerabili, come i minori. \u00c8 contenuto obbligatorio del registro del titolare (art. 30, par. 1, lett. c).',
    categorieDati: 'Descrivi le categorie di dati personali trattati, per esempio \u00abdati anagrafici e di contatto\u00bb, \u00abdati retributivi\u00bb, \u00abdati di navigazione\u00bb. Una categoria per riga; indica in modo esplicito le categorie particolari (art. 9) e i dati relativi a condanne penali e reati (art. 10). \u00c8 contenuto obbligatorio del registro del titolare (art. 30, par. 1, lett. c).',
    fonteDeiDati: 'Indica se i dati sono raccolti presso l\u2019interessato o presso terzi. La distinzione determina gli obblighi di informazione: art. 13 per i dati raccolti presso l\u2019interessato, art. 14 per quelli ottenuti da altre fonti. Non \u00e8 un contenuto richiesto dall\u2019art. 30.',
    fonteDeiDatiDettagli: 'Specifica da quali soggetti o fonti provengono i dati, compresa l\u2019eventuale provenienza da fonti accessibili al pubblico: \u00e8 l\u2019informazione da fornire agli interessati ai sensi dell\u2019art. 14, par. 2, lett. f).',
    categorieDestinatari: 'Indica le categorie di destinatari a cui i dati sono o saranno comunicati, compresi i destinatari in paesi terzi o organizzazioni internazionali (art. 30, par. 1, lett. d), per esempio \u00abistituti di credito\u00bb, \u00abenti previdenziali\u00bb, \u00abfornitori di servizi informatici\u00bb. Sono destinatari anche i responsabili del trattamento (art. 4, n. 9).',
    responsabiliEsterni: 'Elenca i responsabili a cui affidi operazioni su questi dati, cio\u00e8 i soggetti che li trattano per tuo conto, per esempio il consulente del lavoro o il fornitore del gestionale (art. 4, n. 8). Puoi ricorrere solo a responsabili che presentino garanzie sufficienti (art. 28, par. 1).',
    'responsabiliEsterni.accordoArt28Presente': 'Indica se \u00e8 in essere il contratto o altro atto giuridico che disciplina il trattamento da parte del responsabile, con i contenuti previsti dall\u2019art. 28, par. 3: oggetto, durata, natura e finalit\u00e0 del trattamento, tipo di dati, categorie di interessati, obblighi e diritti del titolare.',
    'responsabiliEsterni.notaRuoloPrivacy': 'Annota eventuali precisazioni sul ruolo del soggetto, per esempio se il fornitore agisce in parte come titolare autonomo o se ricorre a sub-responsabili (art. 28, par. 2 e 4).',
    trasferimentiExtraUE: 'Compila solo se i dati sono trasferiti verso paesi terzi o organizzazioni internazionali, anche tramite fornitori o servizi cloud con sede o sub-responsabili fuori dello Spazio economico europeo. Il trasferimento \u00e8 consentito solo nel rispetto del capo V del GDPR (artt. 44-49). \u00c8 contenuto del registro ove applicabile (art. 30, par. 1, lett. e; par. 2, lett. c).',
    'trasferimentiExtraUE.paese': 'Indica il paese terzo o l\u2019organizzazione internazionale destinatari del trasferimento (art. 30, par. 1, lett. e).',
    'trasferimentiExtraUE.garanziaApplicata': 'Indica lo strumento che rende lecito il trasferimento: una decisione di adeguatezza (art. 45); garanzie adeguate come le clausole tipo di protezione dei dati o le norme vincolanti d\u2019impresa (artt. 46 e 47); oppure, in via residuale, una deroga per situazioni specifiche (art. 49).',
    'trasferimentiExtraUE.riferimentoDocumentazione': 'Indica dove \u00e8 documentata la garanzia, per esempio le clausole sottoscritte e l\u2019eventuale valutazione d\u2019impatto del trasferimento. Per i trasferimenti basati sull\u2019art. 49, par. 1, secondo comma, il registro deve riportare la documentazione delle garanzie adeguate (art. 30, par. 1, lett. e).',
    conservazionePeriodo: 'Indica, ove possibile, il termine previsto per la cancellazione delle diverse categorie di dati (art. 30, par. 1, lett. f), per esempio \u00ab10 anni dalla cessazione del rapporto\u00bb. Se non \u00e8 possibile fissare un termine, descrivi nel campo successivo i criteri usati per determinarlo.',
    conservazioneCriteri: 'I criteri con cui \u00e8 stabilito il periodo di conservazione, per esempio un obbligo di legge, il termine di prescrizione dei diritti o la durata del rapporto. I dati vanno conservati per un tempo non superiore al necessario rispetto alle finalit\u00e0 (art. 5, par. 1, lett. e), e il periodo o i criteri vanno comunicati agli interessati (art. 13, par. 2, lett. a; art. 14, par. 2, lett. a).',
    azioneFinale: 'Che cosa accade ai dati alla scadenza: cancellazione; anonimizzazione, dopo la quale i dati non sono pi\u00f9 personali; oppure conservazione a fini di archiviazione nel pubblico interesse, di ricerca scientifica o storica o a fini statistici, con le garanzie dell\u2019art. 89.',
    misureTecniche: 'Descrivi in termini generali le misure tecniche adottate, per esempio cifratura, controllo degli accessi, backup, aggiornamento dei sistemi, registrazione degli accessi. Le misure devono garantire un livello di sicurezza adeguato al rischio (art. 32, par. 1). La loro descrizione generale \u00e8 contenuto del registro ove possibile (art. 30, par. 1, lett. g; par. 2, lett. d).',
    misureOrganizzative: 'Descrivi le misure organizzative, per esempio istruzioni e formazione del personale autorizzato (art. 29 e art. 32, par. 4), procedure per la gestione delle violazioni dei dati (artt. 33 e 34), verifica periodica dell\u2019efficacia delle misure (art. 32, par. 1, lett. d). In Italia, per l\u2019attribuzione di compiti e funzioni a persone designate, rileva l\u2019art. 2-quaterdecies del Codice.',
    sicurezzaRinvio: 'Facoltativo. Rinvia ai documenti in cui le misure sono descritte in dettaglio, per esempio la policy di sicurezza o la valutazione dei rischi: il registro ne contiene solo una descrizione generale.',
    pdaPresenti: 'Indica se il trattamento comporta decisioni basate unicamente su un trattamento automatizzato, compresa la profilazione, che producono effetti giuridici o incidono in modo analogo significativamente sulla persona (art. 22). Non \u00e8 un contenuto richiesto dall\u2019art. 30, ma va comunicato agli interessati (art. 13, par. 2, lett. f; art. 14, par. 2, lett. g).',
    pdaDescrizione: 'Descrivi la decisione automatizzata e in quale fase del trattamento interviene.',
    pdaLogica: 'Informazioni significative sulla logica utilizzata, da fornire agli interessati (art. 13, par. 2, lett. f; art. 14, par. 2, lett. g).',
    pdaConseguenze: 'L\u2019importanza e le conseguenze previste di tale trattamento per l\u2019interessato (art. 13, par. 2, lett. f).',
    pdaDiritti: 'Indica su quale eccezione si fonda la decisione (contratto, legge o consenso esplicito: art. 22, par. 2) e le misure a tutela dell\u2019interessato. Nei casi del contratto e del consenso esplicito, queste comprendono almeno il diritto di ottenere l\u2019intervento umano, di esprimere la propria opinione e di contestare la decisione (art. 22, par. 3).',
    profPresente: 'Indica se i dati sono usati per la profilazione a fini di marketing diretto, cio\u00e8 per valutare aspetti personali come preferenze o interessi (art. 4, n. 4). L\u2019interessato ha sempre il diritto di opporsi a tale trattamento (art. 21, par. 2 e 3).',
    profDescrizione: 'Descrivi quali profili vengono costruiti e per quale finalit\u00e0 di marketing.',
    profLogica: 'Su quali dati e con quali criteri si basa la profilazione.',
    profBaseGiuridica: 'La base giuridica della profilazione, che pu\u00f2 non coincidere con quella del trattamento principale (art. 6, par. 1). In Italia, per le comunicazioni elettroniche di marketing, rileva anche l\u2019art. 130 del Codice.',
    dpiaEffettuata: 'Indica se per questo trattamento \u00e8 stata effettuata una valutazione d\u2019impatto sulla protezione dei dati. \u00c8 obbligatoria quando il trattamento pu\u00f2 presentare un rischio elevato per i diritti e le libert\u00e0 delle persone (art. 35, par. 1), in particolare nei casi dell\u2019art. 35, par. 3, e in quelli indicati negli elenchi dell\u2019autorit\u00e0 di controllo (art. 35, par. 4). In Italia l\u2019elenco \u00e8 contenuto nel provvedimento del Garante n. 467 dell\u201911 ottobre 2018.',
    dpiaRiferimento: 'Gli estremi del documento di valutazione d\u2019impatto, per esempio titolo, data e versione, cos\u00ec da poterlo esibire su richiesta.',
    note: 'Facoltativo. Ogni altra informazione utile a comprendere il trattamento, per esempio decisioni prese, verifiche in corso o rinvii ad altri documenti.'
  }
};

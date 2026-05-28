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
    btnEsporta: 'Esporta / Backup',
    backupAvviso: 'Il file contiene dati personali e non \u00e8 cifrato. Conservalo in un luogo sicuro.',
    erroreBackup: 'Non \u00e8 stato possibile esportare il backup. Riprova.',
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
    btnChiudi: 'Chiudi',
    dettaglioTornaLista: 'Torna al registro',
    dettaglioModifica: 'Modifica',
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
    editorColonnaEn: 'English'
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
      macroStruttura: 'Macro-struttura',
      articolazione: 'Articolazione / Ufficio',
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

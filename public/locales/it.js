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

    // ---- Popolati nello Step B (non ancora importati da app.js) ----
    art9: {},
    fonteDeiDati: {},
    azioneFinale: {},
    garanziaTrasferimento: {},
    tipoRegistro: {}
  }
};

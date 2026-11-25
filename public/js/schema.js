/*
 * ropa30 — schema.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Data model for ROPA (Record of Processing Activities), GDPR Art. 30(1).
 *
 * MULTILINGUAL MODEL (introduced in schema v2):
 * - Free-text, editorial fields are bilingual objects: { it: '', en: '' }.
 * - Codes/enums (legal bases, sources, final actions, transfer guarantees),
 *   booleans, dates, IDs and technical references remain plain values; their
 *   human labels are translated in the UI/export layer, never stored twice.
 * - Settings separate three language concerns:
 *     uiLanguage                 -> interface language (display only)
 *     registro.lingue            -> enabled register languages (1 or 2)
 *     registro.linguaPrincipale  -> primary register language (must be in lingue)
 *
 * Field-name conventions follow Italian GDPR terminology.
 */

// ============================================================================
// SCHEMA VERSION
// ============================================================================
// History (step migrations in db.js, applied in order up to SCHEMA_VERSION):
// v2: multilingual model (bilingual free-text fields) and the settings language
//     structure; v1 plain-string texts are moved into the primary language
//     slot, the other language is left empty (no automatic translation).
// v3: unitaOrganizzativa becomes a list of bilingual units.
// v4: each unitaOrganizzativa item is reduced to { unita: {it,en} }.
// v5: joint controllers recorded per processing activity (contitolari);
//     controllers on whose behalf the processor acts gain representative,
//     DPO and contract reference (the ambiguous 'ruolo' is dropped);
//     the organisation-wide settings.contitolari list is removed.
// Optional additions within data model 5 (data specification 1.1): the
// assessment of the record-keeping obligation under Art. 30(5) —
// settings.obbligoRegistro, settings.dpo.baseDesignazione and, for each
// processing activity, obbligoRegistrazione. Missing values are read as
// "not assessed"; no migration is needed.
export const SCHEMA_VERSION = 5;

// ----------------------------------------------------------------------------
// APP + BACKUP FORMAT VERSIONS
// ----------------------------------------------------------------------------
// APP_VERSION: ropa30 application version (single source of truth for the UI
// and for backup envelopes). Keep in sync with package.json on each release.
// EXPORT_FORMAT_VERSION: version of the JSON backup envelope shape; it evolves
// INDEPENDENTLY from SCHEMA_VERSION (the data shape) and from APP_VERSION.
export const APP_VERSION = '1.7.0';
export const EXPORT_FORMAT_VERSION = 1;

// ============================================================================
// TENANT
// ============================================================================
export const DEFAULT_TENANT_ID = 'default';

// ============================================================================
// LINGUE
// ============================================================================
export const LINGUE_SUPPORTATE = ['it', 'en'];
export const LINGUA_DEFAULT = 'it';

/**
 * Create an empty bilingual text object.
 * Optionally pre-fill one or both languages.
 * @param {string} it
 * @param {string} en
 * @returns {{it:string, en:string}}
 */
export function bilingue(it = '', en = '') {
  return { it: it || '', en: en || '' };
}

// ----------------------------------------------------------------------------
// FACTORY: empty organizational unit (department/office) for unitaOrganizzativa[].
// unita is the bilingual org-unit name (dept/office/area).
// ----------------------------------------------------------------------------
export function unitaOrgVuota() {
  return { unita: bilingue() };
}

// ============================================================================
// TIPO REGISTRO
// ============================================================================
export const TIPO_REGISTRO = {
  TITOLARE: 'titolare',
  RESPONSABILE: 'responsabile'
};

// ============================================================================
// BASI GIURIDICHE EX ART. 6 GDPR
// ============================================================================
export const BASE_GIURIDICA_ART6 = {
  CONSENSO:            'consenso',
  CONTRATTO:           'contratto',
  OBBLIGO_LEGALE:      'obbligo_legale',
  INTERESSE_VITALE:    'interesse_vitale',
  INTERESSE_PUBBLICO:  'interesse_pubblico',
  LEGITTIMO_INTERESSE: 'legittimo_interesse'
};

// ============================================================================
// CONDIZIONI EX ART. 9(2) GDPR
// ============================================================================
export const CONDIZIONE_ART9 = {
  CONSENSO_ESPLICITO:   'consenso_esplicito',
  OBBLIGHI_LAVORO:      'obblighi_lavoro',
  INTERESSE_VITALE:     'interesse_vitale',
  ASSOCIAZIONI:         'associazioni',
  DATI_RESI_PUBBLICI:   'dati_resi_pubblici',
  GIUSTIZIA:            'giustizia',
  INTERESSE_PUBBLICO:   'interesse_pubblico',
  MEDICINA_LAVORO:      'medicina_lavoro',
  SANITA_PUBBLICA:      'sanita_pubblica',
  ARCHIVIAZIONE:        'archiviazione'
};

// ============================================================================
// GARANZIE PER TRASFERIMENTI EXTRA-UE (Capo V GDPR)
// ============================================================================
export const GARANZIA_TRASFERIMENTO = {
  DECISIONE_ADEGUATEZZA: 'decisione_adeguatezza',
  SCC:                   'scc',
  BCR:                   'bcr',
  CODICE_CONDOTTA:       'codice_condotta',
  CERTIFICAZIONE:        'certificazione',
  DEROGA_ART49:          'deroga_art49',
  DA_VERIFICARE:         'da_verificare'
};

// ============================================================================
// FONTE DEI DATI
// ============================================================================
export const FONTE_DATI = {
  INTERESSATO:    'interessato',
  TERZI:          'terzi',
  FONTI_PUBBLICHE:'fonti_pubbliche',
  MISTO:          'misto'
};

// ============================================================================
// AZIONE FINALE SUI DATI
// ============================================================================
export const AZIONE_FINALE_DATI = {
  CANCELLAZIONE:    'cancellazione',
  ANONIMIZZAZIONE:  'anonimizzazione',
  ARCHIVIAZIONE:    'archiviazione',
  CANCELLAZIONE_O_ANONIMIZZAZIONE: 'cancellazione_o_anonimizzazione'
};

// ============================================================================
// TIPI DI AUDIT LOG
// ============================================================================
export const AUDIT_AZIONE = {
  CREATED:   'created',
  UPDATED:   'updated',
  DELETED:   'deleted',
  IMPORTED:  'imported',
  EXPORTED:  'exported',
  RESTORED:  'restored'   // full restore from a backup (replaces the whole database)
};

export const AUDIT_TARGET = {
  SETTINGS:            'settings',
  PROCESSING_ACTIVITY: 'processingActivity',
  DATABASE:            'database'           // whole-database operations (restore, reset)
};

// ============================================================================
// ART. 30(5) — OBLIGATION TO KEEP THE RECORD
// ============================================================================
// Persons employed by the organisation (band declared by the user).
export const PERSONE_IMPIEGATE = {
  MENO_250:     'meno250',
  DA_250_A_999: 'da250a999',
  ALMENO_1000:  'almeno1000'
};
// Nature of the organisation.
export const NATURA_ORGANIZZAZIONE = {
  PRIVATA:  'privata',
  PUBBLICA: 'pubblica'
};
// Legal basis of the DPO designation (Art. 37(1) or voluntary).
export const BASE_DESIGNAZIONE_DPO = {
  ART37_1_A:  'art37_1_a',
  ART37_1_B:  'art37_1_b',
  ART37_1_C:  'art37_1_c',
  FACOLTATIVA:'facoltativa'
};
// Answer to an assessment question.
export const VALUTAZIONE = {
  DA_VALUTARE: 'da_valutare',
  SI:          'si',
  NO:          'no'
};
// Cases of Art. 35(3), points (a), (b) and (c).
export const CASI_ART35_PAR3 = { A: 'a', B: 'b', C: 'c' };
// Version of Art. 30(5) applied by the assessment.
export const REGIME_ART30_5 = {
  VIGENTE:    'vigente',    // text in force: fewer than 250 persons
  OMNIBUS_IV: 'omnibus4'    // as amended by the Omnibus IV Regulation: fewer than 1000
};
// Omnibus IV Regulation (procedure 2025/0130(COD)). Fill in on publication in
// the Official Journal: the date of entry into force (ISO 8601, the twentieth
// day following publication) and the reference of the act. Until then the
// text in force is applied.
export const OMNIBUS_IV = {
  inVigoreDal: null,
  riferimento: { it: '', en: '' }
};

// ============================================================================
// FACTORY: default Settings
// ============================================================================
export function createDefaultSettings() {
  const now = new Date().toISOString();
  // First-run UI language: follow the browser (en -> en, otherwise default).
  const lang = ((typeof navigator !== 'undefined' && navigator.language ? navigator.language : LINGUA_DEFAULT)
                 .slice(0, 2).toLowerCase() === 'en') ? 'en' : 'it';
  return {
    id: 'default',
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,

    // Interface language (display only).
    uiLanguage: lang,

    titolare: {
      denominazione: '',
      formaGiuridica: '',
      partitaIVA: '',
      codiceFiscale: '',
      indirizzo: {
        via: '', civico: '', cap: '', citta: '', provincia: '', paese: 'IT'
      },
      email: '',
      pec: '',
      telefono: '',
      sitoWeb: '',
      settoreAttivita: '',
      rappresentante: {
        presente: false,
        denominazione: '',
        contatto: ''
      }
    },

    dpo: {
      nominato: false,
      nome: '',
      email: '',
      pec: '',
      telefono: '',
      indirizzo: '',
      contattoPubblico: '',
      baseDesignazione: ''               // BASE_DESIGNAZIONE_DPO code or ''
    },

    // Art. 30(5): data used to assess the obligation to keep the record.
    obbligoRegistro: {
      personeImpiegate: '',              // PERSONE_IMPIEGATE code or ''
      natura: ''                         // NATURA_ORGANIZZAZIONE code or ''
    },

    // Register languages: enabled set + primary (invariant: principale ∈ lingue).
    registro: {
      lingue: [lang],
      linguaPrincipale: lang
    },

    metadata: {
      createdAt: now,
      updatedAt: now
    }
  };
}

// ============================================================================
// FACTORY: default Processing Activity (multilingual)
// ============================================================================
export function createDefaultProcessingActivity({ id }) {
  const now = new Date().toISOString();
  return {
    // ---- Identification (technical) ----
    id,
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,
    tipoRegistro: TIPO_REGISTRO.TITOLARE,
    // ---- Art. 30(1)(a) — Contitolari (art. 26), per trattamento ----
    // Used when tipoRegistro === 'titolare'. Each entry:
    //   { denominazione: {it,en}, contatti: '', riferimentoAccordo: {it,en} }
    contitolari: [],
    // ---- Art. 30(2)(a) — Titolari per conto dei quali il responsabile agisce ----
    // Used when tipoRegistro === 'responsabile'. Each entry:
    //   { denominazione: {it,en}, contatti: '', rappresentante: '', dpo: '',
    //     riferimentoContratto: {it,en} }
    titolariPerContoDelQuale: [],

    // ---- Internal classification ----
    // unitaOrganizzativa: list of organizational units (departments/offices) this
    // activity belongs to. Default (a): single unit; but a list supports (b) an
    // activity shared across units. Each item is { unita: {it,en} }, the
    // bilingual org-unit name.
    unitaOrganizzativa: [],
    codiceUtente: '',

    // ---- Provenance (technical) ----
    sourceTemplateId: '',
    sourceTemplateVersion: null,
    sourceTemplateLanguage: '',

    // ---- Core editorial fields (bilingual) ----
    nome: bilingue(),
    descrizione: bilingue(),
    dataInizioTrattamento: '',          // date (not bilingual)

    // ---- Art. 30(1)(b) — Finalità + Basi giuridiche ----
    finalita: [],                       // array of bilingual objects {it,en}
    baseGiuridica: {
      art6: [],                         // enum codes
      dettagliArt6: bilingue(),
      legittimoInteresseDettagli: {
        descrizione: bilingue(),
        garanzieAdottate: bilingue(),
        bilanciamentoEffettuato: false,
        bilanciamentoRichiesto: true,
        riferimentoBilanciamento: bilingue()
      },
      art9: [],                         // enum codes
      dettagliArt9: bilingue()
    },

    // ---- Art. 10 — Condanne penali e reati ----
    datiCondannePenaliReati: {
      presenti: false,
      normativaAutorizzativa: bilingue()
    },

    // ---- Art. 30(1)(c) — Interessati + Dati ----
    categorieInteressati: [],           // array of bilingual objects
    categorieDati: [],                  // array of bilingual objects
    fonteDeiDati: FONTE_DATI.INTERESSATO, // enum code
    fonteDeiDatiDettagli: bilingue(),

    // ---- Art. 30(1)(d) — Destinatari ----
    categorieDestinatari: [],           // array of bilingual objects
    responsabiliEsterni: [],
    // Each entry shape (when present):
    // {
    //   denominazione: {it,en}, sede: {it,en}, finalita: {it,en},
    //   accordoArt28Presente: false, riferimentoContratto: {it,en},
    //   notaRuoloPrivacy: {it,en}
    // }

    // ---- Art. 30(1)(e) — Trasferimenti extra-UE ----
    trasferimentiExtraUE: [],
    // Each entry shape (when present):
    // {
    //   paese: {it,en}, garanziaApplicata: <enum>, riferimentoDocumentazione: {it,en}
    // }

    // ---- Art. 30(1)(f) — Conservazione ----
    tempiConservazione: {
      periodo: bilingue(),
      criteri: bilingue(),
      azioneFinale: AZIONE_FINALE_DATI.CANCELLAZIONE   // enum code
    },

    // ---- Art. 30(1)(g) — Misure di sicurezza ----
    misureSicurezza: {
      tecniche: [],                     // array of bilingual objects
      organizzative: [],                // array of bilingual objects
      rinvioDocumentale: bilingue()
    },

    // ---- Art. 22 — Decisioni automatizzate ----
    processiDecisionaliAutomatizzati: {
      presenti: false,
      descrizione: bilingue(),
      logica: bilingue(),
      conseguenze: bilingue(),
      dirittiInteressato: bilingue()
    },

    // ---- Profilazione marketing ----
    profilazioneMarketing: {
      presente: false,
      descrizione: bilingue(),
      logica: bilingue(),
      baseGiuridicaSpecifica: bilingue()
    },

    // ---- Art. 35 — DPIA ----
    valutazioneDiImpatto: {
      effettuata: false,
      riferimentoDocumento: bilingue()
    },

    // ---- Free notes ----
    note: bilingue(),

    // ---- Art. 30(5) — Assessment of the obligation to record this activity ----
    // Omnibus IV text: rischioElevato, casiArt35par3, attivitaPrincipaleDpo.
    // Text in force: rischio, nonOccasionale (special categories and criminal
    // data are derived from baseGiuridica.art9 and datiCondannePenaliReati).
    obbligoRegistrazione: {
      rischioElevato: VALUTAZIONE.DA_VALUTARE,
      casiArt35par3: [],
      attivitaPrincipaleDpo: VALUTAZIONE.DA_VALUTARE,
      rischio: VALUTAZIONE.DA_VALUTARE,
      nonOccasionale: VALUTAZIONE.DA_VALUTARE,
      motivazione: bilingue()
    },

    // ---- Metadata ----
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1
    }
  };
}

// ============================================================================
// FACTORY: audit log entry
// ============================================================================
export function createAuditEntry({ id, azione, targetType, targetId, summary }) {
  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    timestamp: new Date().toISOString(),
    azione,
    targetType,
    targetId,
    summary: summary || ''
  };
}

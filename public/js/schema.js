/*
 * ropa30 — schema.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Data model for ROPA (Record of Processing Activities), GDPR Art. 30(1).
 *
 * MULTILINGUAL MODEL (schema v2):
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
// v2: introduces the multilingual model (bilingual free-text fields) and the
// new settings language structure. Migration from v1 is handled in db.js
// (Dexie version(2) upgrade): v1 plain-string texts are moved into the primary
// language slot; the other language is left empty (no automatic translation).
export const SCHEMA_VERSION = 3;

// ----------------------------------------------------------------------------
// APP + BACKUP FORMAT VERSIONS
// ----------------------------------------------------------------------------
// APP_VERSION: ropa30 application version (single source of truth for the UI
// and for backup envelopes). Keep in sync with package.json on each release.
// EXPORT_FORMAT_VERSION: version of the JSON backup envelope shape; it evolves
// INDEPENDENTLY from SCHEMA_VERSION (the data shape) and from APP_VERSION.
export const APP_VERSION = '0.0.0';
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
// macroStruttura/articolazione are bilingual org names; codice is a neutral code.
// ----------------------------------------------------------------------------
export function unitaOrgVuota() {
  return { codice: '', macroStruttura: bilingue(), articolazione: bilingue() };
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
// SETTORE
// ============================================================================
export const SETTORE = {
  COMUNE:      'comune',
  PA:          'pa',
  UNIVERSITA:  'universita',
  CAF:         'caf'
};

// ============================================================================
// TIPI DI AUDIT LOG
// ============================================================================
export const AUDIT_AZIONE = {
  CREATED:   'created',
  UPDATED:   'updated',
  DELETED:   'deleted',
  IMPORTED:  'imported',
  EXPORTED:  'exported'
};

export const AUDIT_TARGET = {
  SETTINGS:            'settings',
  PROCESSING_ACTIVITY: 'processingActivity'
};

// ============================================================================
// FACTORY: default Settings (schema v2)
// ============================================================================
export function createDefaultSettings() {
  const now = new Date().toISOString();
  return {
    id: 'default',
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,

    // Interface language (display only).
    uiLanguage: LINGUA_DEFAULT,

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
      contattoPubblico: ''
    },

    contitolari: [],

    // Register languages: enabled set + primary (invariant: principale ∈ lingue).
    registro: {
      lingue: [LINGUA_DEFAULT],
      linguaPrincipale: LINGUA_DEFAULT
    },

    metadata: {
      createdAt: now,
      updatedAt: now
    }
  };
}

// ============================================================================
// FACTORY: default Processing Activity (schema v2 — multilingual)
// ============================================================================
export function createDefaultProcessingActivity({ id }) {
  const now = new Date().toISOString();
  return {
    // ---- Identification (technical) ----
    id,
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,
    tipoRegistro: TIPO_REGISTRO.TITOLARE,

    // ---- Internal classification ----
    // unitaOrganizzativa: list of organizational units (departments/offices) this
    // activity belongs to. Default (a): single unit; but a list supports (b) an
    // activity shared across units. macroStruttura/articolazione are bilingual
    // (org names), codice is a technical/neutral code (not bilingual).
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

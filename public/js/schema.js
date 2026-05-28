/*
 * ropa30 — schema.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Data model for ROPA (Record of Processing Activities), conformant to
 * GDPR Article 30 paragraph 1 (controller's record).
 *
 * This file is pure declarative: constants, enums, and factory functions
 * that produce default-shaped objects. No persistence logic lives here.
 *
 * Design notes:
 * - "tenantId" is set to "default" everywhere; this reserves the field
 *   for a future multi-tenant scenario (a single browser handling
 *   multiple controllers' ROPAs) without requiring an IndexedDB
 *   migration. See ARCHITECTURE.md (to be written) — Case A
 *   forward-compatible design.
 * - "tipoRegistro" is set to "titolare"; it reserves the field for
 *   future GDPR Article 30(2) (processor's record) support — see
 *   ARCHITECTURE.md.
 * - All field names follow Italian GDPR terminology (e.g. "titolare",
 *   "finalita") to match the user's mental model. UI labels are
 *   translated separately in i18n.
 */

// ============================================================================
// SCHEMA VERSION
// ============================================================================
// Bump this number when the data model changes in a way that requires a
// migration. The number is stored on every record so older records can
// be transformed at read time when necessary.
export const SCHEMA_VERSION = 1;

// ============================================================================
// TENANT
// ============================================================================
export const DEFAULT_TENANT_ID = 'default';

// ============================================================================
// TIPO REGISTRO
// ============================================================================
// "titolare"     → Art. 30(1) — record of a controller
// "responsabile" → Art. 30(2) — record of a processor (reserved for v1.1)
export const TIPO_REGISTRO = {
  TITOLARE: 'titolare',
  RESPONSABILE: 'responsabile'
};

// ============================================================================
// BASI GIURIDICHE EX ART. 6 GDPR
// ============================================================================
export const BASE_GIURIDICA_ART6 = {
  CONSENSO:            'consenso',                // Art. 6(1)(a)
  CONTRATTO:           'contratto',               // Art. 6(1)(b)
  OBBLIGO_LEGALE:      'obbligo_legale',          // Art. 6(1)(c)
  INTERESSE_VITALE:    'interesse_vitale',        // Art. 6(1)(d)
  INTERESSE_PUBBLICO:  'interesse_pubblico',      // Art. 6(1)(e)
  LEGITTIMO_INTERESSE: 'legittimo_interesse'      // Art. 6(1)(f)
};

// ============================================================================
// CONDIZIONI EX ART. 9(2) GDPR (categorie particolari di dati)
// ============================================================================
export const CONDIZIONE_ART9 = {
  CONSENSO_ESPLICITO:   'consenso_esplicito',     // Art. 9(2)(a)
  OBBLIGHI_LAVORO:      'obblighi_lavoro',        // Art. 9(2)(b)
  INTERESSE_VITALE:     'interesse_vitale',       // Art. 9(2)(c)
  ASSOCIAZIONI:         'associazioni',           // Art. 9(2)(d)
  DATI_RESI_PUBBLICI:   'dati_resi_pubblici',     // Art. 9(2)(e)
  GIUSTIZIA:            'giustizia',              // Art. 9(2)(f)
  INTERESSE_PUBBLICO:   'interesse_pubblico',     // Art. 9(2)(g)
  MEDICINA_LAVORO:      'medicina_lavoro',        // Art. 9(2)(h)
  SANITA_PUBBLICA:      'sanita_pubblica',        // Art. 9(2)(i)
  ARCHIVIAZIONE:        'archiviazione'           // Art. 9(2)(j)
};

// ============================================================================
// GARANZIE PER TRASFERIMENTI EXTRA-UE (Capo V GDPR)
// ============================================================================
export const GARANZIA_TRASFERIMENTO = {
  DECISIONE_ADEGUATEZZA: 'decisione_adeguatezza', // Art. 45
  SCC:                   'scc',                   // Art. 46(2)(c) — Clausole contrattuali tipo
  BCR:                   'bcr',                   // Art. 47 — Norme vincolanti d'impresa
  CODICE_CONDOTTA:       'codice_condotta',       // Art. 46(2)(e)
  CERTIFICAZIONE:        'certificazione',        // Art. 46(2)(f)
  DEROGA_ART49:          'deroga_art49',           // Art. 49 — deroghe in situazioni specifiche
  DA_VERIFICARE:         'da_verificare'          // placeholder: garanzia da accertare in concreto
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
// AZIONE FINALE SUI DATI (al termine del periodo di conservazione)
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
  EXPORTED:  'exported'
};

export const AUDIT_TARGET = {
  SETTINGS:            'settings',
  PROCESSING_ACTIVITY: 'processingActivity'
};

// ============================================================================
// FACTORY: default empty Settings object
// ============================================================================
// Produces a fully-shaped settings record with empty values, ready to be
// filled by the onboarding wizard.
export function createDefaultSettings() {
  const now = new Date().toISOString();
  return {
    id: 'default',
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,

    titolare: {
      denominazione: '',
      formaGiuridica: '',
      partitaIVA: '',
      codiceFiscale: '',
      indirizzo: {
        via: '',
        civico: '',
        cap: '',
        citta: '',
        provincia: '',
        paese: 'IT'
      },
      email: '',
      pec: '',
      telefono: '',
      settoreAttivita: '',
      // Rappresentante per soggetti non UE (Art. 27 GDPR)
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
      // Contatto pubblico ex Art. 37(7)
      contattoPubblico: ''
    },

    // Contitolari ex Art. 26 GDPR
    contitolari: [],

    // Preferenza UI dell'utente
    lingua: 'it',

    metadata: {
      createdAt: now,
      updatedAt: now
    }
  };
}

// ============================================================================
// FACTORY: default empty Processing Activity
// ============================================================================
// Produces a fully-shaped processing activity record with empty values,
// ready to be filled by the user.
export function createDefaultProcessingActivity({ id }) {
  const now = new Date().toISOString();
  return {
    // ---- Identification ----
    id,
    tenantId: DEFAULT_TENANT_ID,
    schemaVersion: SCHEMA_VERSION,
    tipoRegistro: TIPO_REGISTRO.TITOLARE,
    // ---- Unità organizzativa (classificazione interna opzionale) ----
    // Per enti complessi (università, PA, grandi aziende): consente di
    // raggruppare/filtrare i trattamenti per struttura interna, restando in
    // un unico registro del medesimo titolare. macroStruttura = livello alto
    // (es. "Dipartimento di Giurisprudenza", "Amministrazione Centrale");
    // articolazione = livello di dettaglio (es. "Area Affari legali —
    // Servizio Privacy"). Entrambi opzionali; vuoti per chi non ne ha bisogno.
    unitaOrganizzativa: {
      macroStruttura: '',
      articolazione: ''
    },
    codiceUtente: '',
    nome: '',
    descrizione: '',
    dataInizioTrattamento: '',

    // ---- Art. 30(1)(b) — Finalità + Basi giuridiche ----
    finalita: [],
    baseGiuridica: {
      art6: [],                  // array of BASE_GIURIDICA_ART6 values
      dettagliArt6: '',
      legittimoInteresseDettagli: {
        descrizione: '',
        garanzieAdottate: '',
        bilanciamentoEffettuato: false,
        bilanciamentoRichiesto: true,
        riferimentoBilanciamento: ''
      },
      art9: [],                  // array of CONDIZIONE_ART9 values
      dettagliArt9: ''
    },

    // ---- Art. 10 GDPR — Dati relativi a condanne penali e reati ----
    datiCondannePenaliReati: {
      presenti: false,
      normativaAutorizzativa: ''
    },

    // ---- Art. 30(1)(c) — Interessati + Dati ----
    categorieInteressati: [],
    categorieDati: [],
    fonteDeiDati: FONTE_DATI.INTERESSATO,
    fonteDeiDatiDettagli: '',

    // ---- Art. 30(1)(d) — Destinatari ----
    categorieDestinatari: [],
    responsabiliEsterni: [],
    // Each entry has shape:
    // {
    //   denominazione, sede, finalita,
    //   accordoArt28Presente: false, riferimentoContratto,
    //   notaRuoloPrivacy: {it,en}  (opzionale: per soggetti il cui ruolo
    //   privacy va verificato — responsabile ex art. 28 vs titolare autonomo,
    //   es. payment provider, corrieri, commercialisti)
    // }

    // ---- Art. 30(1)(e) — Trasferimenti extra-UE ----
    trasferimentiExtraUE: [],
    // Each entry has shape:
    // {
    //   paese, garanziaApplicata, riferimentoDocumentazione
    // }

    // ---- Art. 30(1)(f) — Conservazione ----
    tempiConservazione: {
      periodo: '',
      criteri: '',
      azioneFinale: AZIONE_FINALE_DATI.CANCELLAZIONE
    },

    // ---- Art. 30(1)(g) — Misure di sicurezza ----
    misureSicurezza: {
      tecniche: [],
      organizzative: [],
      rinvioDocumentale: ''
    },

    // ---- Art. 22 — Decisioni automatizzate ----
    processiDecisionaliAutomatizzati: {
      presenti: false,
      descrizione: '',
      logica: '',
      conseguenze: '',
      dirittiInteressato: ''
    },

    // ---- Profilazione marketing (separata dalla profilazione automatizzata ex Art. 22) ----
    // Tracciamento di aperture, click, preferenze tematiche o comportamenti per segmentare
    // i destinatari o personalizzare le comunicazioni. Diversa dalla profilazione "decisionale"
    // dell'Art. 22: qui si tratta di comunicazioni personalizzate, non di decisioni con effetti
    // giuridici/significativi sulla persona.
    profilazioneMarketing: {
      presente: false,
      descrizione: '',
      logica: '',
      baseGiuridicaSpecifica: ''
    },

    // ---- Art. 35 — DPIA ----
    valutazioneDiImpatto: {
      effettuata: false,
      riferimentoDocumento: ''
    },

    // ---- Free notes ----
    note: '',

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

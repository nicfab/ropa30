/*
 * ropa30 — detail.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PURE module: builds the read-only detail view-model for a processing
 * activity (GDPR Art. 30). No Alpine, no DOM, no window — it receives a
 * record + active language + injected locale strings/enums and returns a
 * plain data structure. This keeps it reusable for export (PDF/XLSX/ODS)
 * and unit-testable in isolation (e.g. from Node).
 *
 * CONTRACT
 *   buildDettaglio(record, lang, deps) -> { sezioni: Section[] }
 *     record : raw processing activity (schema v2)
 *     lang   : 'it' | 'en' (active UI language)
 *     deps   : { detail, enums }
 *              detail = locale.detail  ({ sezioni, campi, stati })
 *              enums  = locale.enums   (code -> label maps)
 *
 * SHAPES
 *   Section = { id, titolo, campi: Field[] }
 *   Field   = { label, tipo, value, items, gruppi, missingTranslation, mostra }
 *     tipo ∈ 'testo' | 'data' | 'enum' | 'bool' | 'lista' | 'gruppi'
 *
 * MISSING-TRANSLATION RULE (detail view, decision 1a — NO silent fallback):
 *   active filled              -> value = text,        missingTranslation = false
 *   active empty + other full  -> value = '—' (vuoto), missingTranslation = true   (badge)
 *   active empty + other empty -> value = '—' (vuoto), missingTranslation = false  (no badge)
 */

// ---------------------------------------------------------------------------
// Internal resolvers (pure)
// ---------------------------------------------------------------------------

// Resolve a bilingual {it,en} object under the detail missing-translation rule.
// Returns { value, missingTranslation }.
function resolveTesto(obj, lang, stati) {
  const vuoto = stati.vuoto;
  if (!obj || typeof obj !== 'object') {
    return { value: vuoto, missingTranslation: false };
  }
  const attiva = (obj[lang] || '').trim();
  if (attiva) return { value: attiva, missingTranslation: false };
  const altraLang = (lang === 'it') ? 'en' : 'it';
  const altra = (obj[altraLang] || '').trim();
  // active empty: badge only if the OTHER language has content.
  return { value: vuoto, missingTranslation: altra.length > 0 };
}

// Resolve an enum code to its localized label (no missing-translation concept:
// enum labels are UI i18n, always present in both languages).
function resolveEnum(code, mappa, stati) {
  if (!code) return { value: stati.vuoto, missingTranslation: false };
  return { value: (mappa && mappa[code]) || code, missingTranslation: false };
}

// Resolve a boolean to Sì/No.
function resolveBool(val, stati) {
  return { value: val ? stati.si : stati.no, missingTranslation: false };
}

// Resolve an ISO date string to a locale-formatted date.
function resolveData(iso, lang, stati) {
  if (!iso) return { value: stati.vuoto, missingTranslation: false };
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return { value: iso, missingTranslation: false };
    const locale = (lang === 'en') ? 'en-GB' : 'it-IT';
    return {
      value: dt.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
      missingTranslation: false
    };
  } catch (e) {
    return { value: iso, missingTranslation: false };
  }
}

// Resolve an array of bilingual {it,en} objects to a list of items.
// Each item: { value, missingTranslation }. Empty array -> empty items.
function resolveLista(arr, lang, stati) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.map((o) => resolveTesto(o, lang, stati));
}

// ---------------------------------------------------------------------------
// Field builders (small helpers to keep section code readable)
// ---------------------------------------------------------------------------

function campoTesto(label, obj, lang, stati) {
  const r = resolveTesto(obj, lang, stati);
  return { label, tipo: 'testo', value: r.value, items: [], gruppi: [],
    missingTranslation: r.missingTranslation, mostra: true };
}
function campoData(label, iso, lang, stati) {
  const r = resolveData(iso, lang, stati);
  return { label, tipo: 'data', value: r.value, items: [], gruppi: [],
    missingTranslation: false, mostra: true };
}
function campoEnum(label, code, mappa, stati) {
  const r = resolveEnum(code, mappa, stati);
  return { label, tipo: 'enum', value: r.value, items: [], gruppi: [],
    missingTranslation: false, mostra: true };
}
function campoBool(label, val, stati) {
  const r = resolveBool(val, stati);
  return { label, tipo: 'bool', value: r.value, items: [], gruppi: [],
    missingTranslation: false, mostra: true };
}
function campoLista(label, arr, lang, stati) {
  const items = resolveLista(arr, lang, stati);
  return { label, tipo: 'lista', value: '', items, gruppi: [],
    missingTranslation: false, mostra: true,
    vuota: items.length === 0, etichettaVuota: stati.nonPresente };
}

// Build a repeated-group field from an array of sub-objects.
// `mappa` describes each sub-field: { chiave, label, tipo, enumMappa? }.
// tipo ∈ 'testo' | 'bool' | 'enum'. Empty array -> mostra placeholder.
function campoGruppi(label, arr, mappa, lang, stati) {
  const lista = Array.isArray(arr) ? arr : [];
  const gruppi = lista.map((el) => {
    const campi = mappa.map((m) => {
      if (m.tipo === 'bool') {
        const r = resolveBool(!!el[m.chiave], stati);
        return { label: m.label, tipo: 'bool', value: r.value, missingTranslation: false };
      }
      if (m.tipo === 'enum') {
        const r = resolveEnum(el[m.chiave], m.enumMappa, stati);
        return { label: m.label, tipo: 'enum', value: r.value, missingTranslation: false };
      }
      const r = resolveTesto(el[m.chiave], lang, stati);
      return { label: m.label, tipo: 'testo', value: r.value, missingTranslation: r.missingTranslation };
    });
    return { campi };
  });
  return { label, tipo: 'gruppi', value: '', items: [], gruppi,
    missingTranslation: false, mostra: true,
    vuota: gruppi.length === 0, etichettaVuota: stati.nonPresente };
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildDettaglio(record, lang, deps) {
  const r = record || {};
  const C = (deps && deps.detail && deps.detail.campi) || {};
  const S = (deps && deps.detail && deps.detail.sezioni) || {};
  const ST = (deps && deps.detail && deps.detail.stati) || { vuoto: '—' };
  const E = (deps && deps.enums) || {};

  const sezioni = [];

  // ---- Sez. 1 — Identificazione --------------------------------------------
  const bg = r.baseGiuridica || {};
  const uo = r.unitaOrganizzativa || {};
  sezioni.push({
    id: 'identificazione',
    titolo: S.identificazione,
    campi: [
      campoTesto(C.nome, r.nome, lang, ST),
      campoTesto(C.descrizione, r.descrizione, lang, ST),
      campoEnum(C.tipoRegistro, r.tipoRegistro, E.tipoRegistro, ST),
      campoData(C.dataInizioTrattamento, r.dataInizioTrattamento, lang, ST),
      campoTesto(C.macroStruttura, { it: uo.macroStruttura || '', en: uo.macroStruttura || '' }, lang, ST),
      campoTesto(C.articolazione, { it: uo.articolazione || '', en: uo.articolazione || '' }, lang, ST),
      campoTesto(C.codiceUtente, { it: r.codiceUtente || '', en: r.codiceUtente || '' }, lang, ST)
    ]
  });

  // ---- Sez. 2 — Finalità ----------------------------------------------------
  sezioni.push({
    id: 'finalita',
    titolo: S.finalita,
    campi: [
      campoLista(C.finalita, r.finalita, lang, ST)
    ]
  });

  // ---- Sez. 3 — Basi giuridiche ---------------------------------------------
  const art6arr = Array.isArray(bg.art6) ? bg.art6 : [];
  const art6Labels = art6arr.map((k) => (E.art6 && E.art6[k]) || k);
  const li = bg.legittimoInteresseDettagli || {};
  const haLI = art6arr.indexOf('legittimo_interesse') !== -1;
  const art9arr = Array.isArray(bg.art9) ? bg.art9 : [];
  const art9Labels = art9arr.map((k) => (E.art9 && E.art9[k]) || k);

  const campiBasi = [
    // art6 as a fixed (already-localized) list of enum labels
    { label: C.art6, tipo: 'lista', value: '',
      items: art6Labels.map((t) => ({ value: t, missingTranslation: false })),
      gruppi: [], missingTranslation: false, mostra: true,
      vuota: art6Labels.length === 0, etichettaVuota: ST.vuoto },
    campoTesto(C.dettagliArt6, bg.dettagliArt6, lang, ST)
  ];

  // Legitimate-interest block: only if 'legittimo_interesse' is among art6 (decision 2).
  if (haLI) {
    campiBasi.push(campoTesto(C.liDescrizione, li.descrizione, lang, ST));
    campiBasi.push(campoTesto(C.liGaranzie, li.garanzieAdottate, lang, ST));
    campiBasi.push(campoBool(C.liBilanciamentoEffettuato, !!li.bilanciamentoEffettuato, ST));
    // liBilanciamentoRichiesto intentionally omitted from the detail view (decision 3).
    campiBasi.push(campoTesto(C.liRiferimento, li.riferimentoBilanciamento, lang, ST));
  }

  campiBasi.push({ label: C.art9, tipo: 'lista', value: '',
    items: art9Labels.map((t) => ({ value: t, missingTranslation: false })),
    gruppi: [], missingTranslation: false, mostra: true,
    vuota: art9Labels.length === 0, etichettaVuota: ST.nonPresente });
  campiBasi.push(campoTesto(C.dettagliArt9, bg.dettagliArt9, lang, ST));

  sezioni.push({ id: 'basiGiuridiche', titolo: S.basiGiuridiche, campi: campiBasi });

  // ---- Sez. 4 — Condanne penali e reati (art. 10) ---------------------------
  const cp = r.datiCondannePenaliReati || {};
  const campiCondanne = [ campoBool(C.condanneePresenti, !!cp.presenti, ST) ];
  // Show sub-fields only if present (decision 1).
  if (cp.presenti) {
    campiCondanne.push(campoTesto(C.condanneNormativa, cp.normativaAutorizzativa, lang, ST));
  }
  sezioni.push({ id: 'condannePenali', titolo: S.condannePenali, campi: campiCondanne });

  // ---- Sez. 5 — Categorie di interessati -----------------------------------
  sezioni.push({
    id: 'categorieInteressati',
    titolo: S.categorieInteressati,
    campi: [
      campoLista(C.categorieInteressati, r.categorieInteressati, lang, ST)
    ]
  });

  // ---- Sez. 6 — Categorie di dati ------------------------------------------
  sezioni.push({
    id: 'categorieDati',
    titolo: S.categorieDati,
    campi: [
      campoLista(C.categorieDati, r.categorieDati, lang, ST),
      campoEnum(C.fonteDeiDati, r.fonteDeiDati, E.fonteDeiDati, ST),
      campoTesto(C.fonteDeiDatiDettagli, r.fonteDeiDatiDettagli, lang, ST)
    ]
  });

  // ---- Sez. 7 — Destinatari -------------------------------------------------
  const mappaResp = [
    { chiave: 'denominazione',       label: C.reDenominazione,        tipo: 'testo' },
    { chiave: 'sede',                label: C.reSede,                 tipo: 'testo' },
    { chiave: 'finalita',            label: C.reFinalita,             tipo: 'testo' },
    { chiave: 'accordoArt28Presente',label: C.reAccordoArt28,         tipo: 'bool'  },
    { chiave: 'riferimentoContratto',label: C.reRiferimentoContratto, tipo: 'testo' },
    { chiave: 'notaRuoloPrivacy',    label: C.reNotaRuolo,            tipo: 'testo' }
  ];
  sezioni.push({
    id: 'destinatari',
    titolo: S.destinatari,
    campi: [
      campoLista(C.categorieDestinatari, r.categorieDestinatari, lang, ST),
      campoGruppi(C.responsabiliEsterni, r.responsabiliEsterni, mappaResp, lang, ST)
    ]
  });

  // ---- Sez. 8 — Trasferimenti verso Paesi terzi ----------------------------
  const mappaTrasf = [
    { chiave: 'paese',                    label: C.trPaese,       tipo: 'testo' },
    { chiave: 'garanziaApplicata',        label: C.trGaranzia,    tipo: 'enum', enumMappa: E.garanziaTrasferimento },
    { chiave: 'riferimentoDocumentazione',label: C.trRiferimento, tipo: 'testo' }
  ];
  sezioni.push({
    id: 'trasferimenti',
    titolo: S.trasferimenti,
    campi: [
      campoGruppi(C.trasferimentiExtraUE, r.trasferimentiExtraUE, mappaTrasf, lang, ST)
    ]
  });

  // ---- Sez. 9 — Conservazione ----------------------------------------------
  const cons = r.tempiConservazione || {};
  sezioni.push({
    id: 'conservazione',
    titolo: S.conservazione,
    campi: [
      campoTesto(C.conservazionePeriodo, cons.periodo, lang, ST),
      campoTesto(C.conservazioneCriteri, cons.criteri, lang, ST),
      campoEnum(C.azioneFinale, cons.azioneFinale, E.azioneFinale, ST)
    ]
  });

  // ---- Sez. 10 — Misure di sicurezza ---------------------------------------
  const sic = r.misureSicurezza || {};
  sezioni.push({
    id: 'sicurezza',
    titolo: S.sicurezza,
    campi: [
      campoLista(C.misureTecniche, sic.tecniche, lang, ST),
      campoLista(C.misureOrganizzative, sic.organizzative, lang, ST),
      campoTesto(C.sicurezzaRinvio, sic.rinvioDocumentale, lang, ST)
    ]
  });

  // ---- Sez. 11 — Processi automatizzati e profilazione ---------------------
  const pda = r.processiDecisionaliAutomatizzati || {};
  const prof = r.profilazioneMarketing || {};
  const campiAuto = [ campoBool(C.pdaPresenti, !!pda.presenti, ST) ];
  if (pda.presenti) {
    campiAuto.push(campoTesto(C.pdaDescrizione, pda.descrizione, lang, ST));
    campiAuto.push(campoTesto(C.pdaLogica, pda.logica, lang, ST));
    campiAuto.push(campoTesto(C.pdaConseguenze, pda.conseguenze, lang, ST));
    campiAuto.push(campoTesto(C.pdaDiritti, pda.dirittiInteressato, lang, ST));
  }
  campiAuto.push(campoBool(C.profPresente, !!prof.presente, ST));
  if (prof.presente) {
    campiAuto.push(campoTesto(C.profDescrizione, prof.descrizione, lang, ST));
    campiAuto.push(campoTesto(C.profLogica, prof.logica, lang, ST));
    campiAuto.push(campoTesto(C.profBaseGiuridica, prof.baseGiuridicaSpecifica, lang, ST));
  }
  sezioni.push({ id: 'automatizzati', titolo: S.automatizzati, campi: campiAuto });

  // ---- Sez. 12 — DPIA e note -----------------------------------------------
  const vdi = r.valutazioneDiImpatto || {};
  const campiDpia = [ campoBool(C.dpiaEffettuata, !!vdi.effettuata, ST) ];
  if (vdi.effettuata) {
    campiDpia.push(campoTesto(C.dpiaRiferimento, vdi.riferimentoDocumento, lang, ST));
  }
  campiDpia.push(campoTesto(C.note, r.note, lang, ST));
  sezioni.push({ id: 'dpiaNote', titolo: S.dpiaNote, campi: campiDpia });

  return { sezioni };
}

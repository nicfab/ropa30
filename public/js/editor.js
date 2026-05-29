/*
 * ropa30 — editor.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PURE write-side view-model for editing a processing activity (the twin of
 * detail.js, the read-side view-model). No Alpine, no DOM, no window: fully
 * unit-testable in Node.
 *
 * buildEditModel(record, { lingue, detail, enums })
 *   -> { sezioni:[{ id, titolo, ancora, indice, campi:[control,...] }], lingue }
 *   Each control is a FLAT object with WRITABLE value properties (valIt/valEn,
 *   val, opzioni[].sel, voci, righe): the CSP constraint validated by the C0
 *   spike (Alpine binds x-model onto object.property, incl. x-for items, NOT
 *   deep dotted paths into the record). Editable state lives in the controls;
 *   at save time the record is recomposed via applyEditModel().
 *
 * applyEditModel(record, editModel) -> record  (record is a clone; source safe)
 */

// --- Path helpers (dotted string -> nested access) ---
function getByPath(obj, path) {
  if (!path) return undefined;
  let cur = obj;
  for (const p of path.split('.')) { if (cur == null) return undefined; cur = cur[p]; }
  return cur;
}
function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}
function opzioniDa(mappa) {
  const m = mappa || {};
  return Object.keys(m).map((code) => ({ code, label: m[code] }));
}

// --- Control constructors ---
function ctlTestoBil(chiave, path, label, bil, multilinea) {
  const b = bil || {};
  return { chiave, tipo: 'testoBil', isTestoBil: true, path, label,
    valIt: b.it || '', valEn: b.en || '', multilinea: !!multilinea };
}
function ctlPiano(chiave, path, label, val) {
  return { chiave, tipo: 'piano', isPiano: true, path, label, val: val || '' };
}
function ctlData(chiave, path, label, val) {
  return { chiave, tipo: 'data', isData: true, path, label, val: val || '' };
}
function ctlEnum1(chiave, path, label, val, mappa) {
  return { chiave, tipo: 'enum1', isEnum1: true, path, label, val: val || '', opzioni: opzioniDa(mappa) };
}
function ctlEnumN(chiave, path, label, arr, mappa) {
  const sel = Array.isArray(arr) ? arr : [];
  const m = mappa || {};
  const opzioni = Object.keys(m).map((code) => ({ code, label: m[code], sel: sel.indexOf(code) !== -1 }));
  return { chiave, tipo: 'enumN', isEnumN: true, path, label, opzioni };
}
function ctlBool(chiave, path, label, val, figli) {
  const f = figli || [];
  return { chiave, tipo: 'bool', isBool: true, path, label, val: !!val, figli: f, haFigli: f.length > 0 };
}
function ctlListaBil(chiave, path, label, arr, gruppoTipo, multilinea) {
  const voci = (Array.isArray(arr) ? arr : []).map((b) => ({ valIt: (b && b.it) || '', valEn: (b && b.en) || '' }));
  return { chiave, tipo: 'listaBil', isListaBil: true, path, label, voci, gruppoTipo, multilinea: !!multilinea };
}
function ctlGruppi(chiave, path, label, righe, gruppoTipo, voceLabel) {
  return { chiave, tipo: 'gruppi', isGruppi: true, path, label, righe, gruppoTipo, voceLabel: voceLabel || label };
}

// --- Group-row builders (render existing rows AND add blank ones) ---
function rigaResponsabile(entry, detail, titolo) {
  const C = detail.campi; const e = entry || {};
  return { rigaTitolo: titolo || '', campi: [
    ctlTestoBil('denominazione', '', C.reDenominazione, e.denominazione, false),
    ctlTestoBil('sede', '', C.reSede, e.sede, false),
    ctlTestoBil('finalita', '', C.reFinalita, e.finalita, true),
    ctlBool('accordoArt28Presente', '', C.reAccordoArt28, e.accordoArt28Presente),
    ctlTestoBil('riferimentoContratto', '', C.reRiferimentoContratto, e.riferimentoContratto, false),
    ctlTestoBil('notaRuoloPrivacy', '', C.reNotaRuolo, e.notaRuoloPrivacy, true)
  ] };
}
function rigaTrasferimento(entry, detail, enums, titolo) {
  const C = detail.campi; const e = entry || {};
  return { rigaTitolo: titolo || '', campi: [
    ctlTestoBil('paese', '', C.trPaese, e.paese, false),
    ctlEnum1('garanziaApplicata', '', C.trGaranzia, e.garanziaApplicata, enums.garanziaTrasferimento),
    ctlTestoBil('riferimentoDocumentazione', '', C.trRiferimento, e.riferimentoDocumentazione, true)
  ] };
}
function rigaUnitaOrganizzativa(entry, detail, titolo) {
  const C = detail.campi; const e = entry || {};
  return { rigaTitolo: titolo || '', campi: [
    ctlTestoBil('unita', '', C.uoUnita, e.unita, false)
  ] };
}
function righeDaArray(gruppoTipo, arr, detail, enums, baseLabel) {
  const a = Array.isArray(arr) ? arr : [];
  const tit = (i) => (baseLabel || '') + ' ' + (i + 1);
  if (gruppoTipo === 'responsabiliEsterni') return a.map((e, i) => rigaResponsabile(e, detail, tit(i)));
  if (gruppoTipo === 'trasferimentiExtraUE') return a.map((e, i) => rigaTrasferimento(e, detail, enums, tit(i)));
  if (gruppoTipo === 'unitaOrganizzativa') return a.map((e, i) => rigaUnitaOrganizzativa(e, detail, tit(i)));
  return [];
}

// --- buildEditModel: record -> 12-section edit model ---
export function buildEditModel(record, { lingue, detail, enums }) {
  const r = record || {};
  const C = detail.campi;
  const S = detail.sezioni;
  const g = (p) => getByPath(r, p);
  const sezioni = [];

  // 1 — Identificazione
  sezioni.push({ id: 'identificazione', titolo: S.identificazione, campi: [
    ctlTestoBil('nome', 'nome', C.nome, g('nome'), false),
    ctlTestoBil('descrizione', 'descrizione', C.descrizione, g('descrizione'), true),
    ctlEnum1('tipoRegistro', 'tipoRegistro', C.tipoRegistro, g('tipoRegistro'), enums.tipoRegistro),
    ctlData('dataInizioTrattamento', 'dataInizioTrattamento', C.dataInizioTrattamento, g('dataInizioTrattamento')),
    ctlGruppi('unitaOrganizzativa', 'unitaOrganizzativa', C.unitaOrganizzativa, righeDaArray('unitaOrganizzativa', g('unitaOrganizzativa'), detail, enums, C.unitaOrganizzativa), 'unitaOrganizzativa', C.unitaOrganizzativa),
    ctlPiano('codiceUtente', 'codiceUtente', C.codiceUtente, g('codiceUtente'))
  ] });

  // 2 — Finalità
  sezioni.push({ id: 'finalita', titolo: S.finalita, campi: [
    ctlListaBil('finalita', 'finalita', C.finalita, g('finalita'), 'finalita', false)
  ] });

  // 3 — Basi giuridiche (LI block always shown by design)
  sezioni.push({ id: 'basiGiuridiche', titolo: S.basiGiuridiche, campi: [
    ctlEnumN('art6', 'baseGiuridica.art6', C.art6, g('baseGiuridica.art6'), enums.art6),
    ctlTestoBil('dettagliArt6', 'baseGiuridica.dettagliArt6', C.dettagliArt6, g('baseGiuridica.dettagliArt6'), true),
    ctlTestoBil('liDescrizione', 'baseGiuridica.legittimoInteresseDettagli.descrizione', C.liDescrizione, g('baseGiuridica.legittimoInteresseDettagli.descrizione'), true),
    ctlTestoBil('liGaranzie', 'baseGiuridica.legittimoInteresseDettagli.garanzieAdottate', C.liGaranzie, g('baseGiuridica.legittimoInteresseDettagli.garanzieAdottate'), true),
    ctlBool('liBilanciamentoEffettuato', 'baseGiuridica.legittimoInteresseDettagli.bilanciamentoEffettuato', C.liBilanciamentoEffettuato, g('baseGiuridica.legittimoInteresseDettagli.bilanciamentoEffettuato')),
    ctlBool('liBilanciamentoRichiesto', 'baseGiuridica.legittimoInteresseDettagli.bilanciamentoRichiesto', C.liBilanciamentoRichiesto, g('baseGiuridica.legittimoInteresseDettagli.bilanciamentoRichiesto')),
    ctlTestoBil('liRiferimento', 'baseGiuridica.legittimoInteresseDettagli.riferimentoBilanciamento', C.liRiferimento, g('baseGiuridica.legittimoInteresseDettagli.riferimentoBilanciamento'), false),
    ctlEnumN('art9', 'baseGiuridica.art9', C.art9, g('baseGiuridica.art9'), enums.art9),
    ctlTestoBil('dettagliArt9', 'baseGiuridica.dettagliArt9', C.dettagliArt9, g('baseGiuridica.dettagliArt9'), true)
  ] });

  // 4 — Condanne penali e reati (art. 10)
  sezioni.push({ id: 'condannePenali', titolo: S.condannePenali, campi: [
    ctlBool('condanneePresenti', 'datiCondannePenaliReati.presenti', C.condanneePresenti, g('datiCondannePenaliReati.presenti'), [
      ctlTestoBil('condanneNormativa', 'datiCondannePenaliReati.normativaAutorizzativa', C.condanneNormativa, g('datiCondannePenaliReati.normativaAutorizzativa'), true)
    ])
  ] });

  // 5 — Categorie di interessati
  sezioni.push({ id: 'categorieInteressati', titolo: S.categorieInteressati, campi: [
    ctlListaBil('categorieInteressati', 'categorieInteressati', C.categorieInteressati, g('categorieInteressati'), 'categorieInteressati', false)
  ] });

  // 6 — Categorie di dati
  sezioni.push({ id: 'categorieDati', titolo: S.categorieDati, campi: [
    ctlListaBil('categorieDati', 'categorieDati', C.categorieDati, g('categorieDati'), 'categorieDati', false),
    ctlEnum1('fonteDeiDati', 'fonteDeiDati', C.fonteDeiDati, g('fonteDeiDati'), enums.fonteDeiDati),
    ctlTestoBil('fonteDeiDatiDettagli', 'fonteDeiDatiDettagli', C.fonteDeiDatiDettagli, g('fonteDeiDatiDettagli'), true)
  ] });

  // 7 — Destinatari
  sezioni.push({ id: 'destinatari', titolo: S.destinatari, campi: [
    ctlListaBil('categorieDestinatari', 'categorieDestinatari', C.categorieDestinatari, g('categorieDestinatari'), 'categorieDestinatari', false),
    ctlGruppi('responsabiliEsterni', 'responsabiliEsterni', C.responsabiliEsterni, righeDaArray('responsabiliEsterni', g('responsabiliEsterni'), detail, enums, C.responsabiliEsterni), 'responsabiliEsterni', C.responsabiliEsterni)
  ] });

  // 8 — Trasferimenti verso Paesi terzi
  sezioni.push({ id: 'trasferimenti', titolo: S.trasferimenti, campi: [
    ctlGruppi('trasferimentiExtraUE', 'trasferimentiExtraUE', C.trasferimentiExtraUE, righeDaArray('trasferimentiExtraUE', g('trasferimentiExtraUE'), detail, enums, C.trasferimentiExtraUE), 'trasferimentiExtraUE', C.trasferimentiExtraUE)
  ] });

  // 9 — Conservazione
  sezioni.push({ id: 'conservazione', titolo: S.conservazione, campi: [
    ctlTestoBil('conservazionePeriodo', 'tempiConservazione.periodo', C.conservazionePeriodo, g('tempiConservazione.periodo'), false),
    ctlTestoBil('conservazioneCriteri', 'tempiConservazione.criteri', C.conservazioneCriteri, g('tempiConservazione.criteri'), true),
    ctlEnum1('azioneFinale', 'tempiConservazione.azioneFinale', C.azioneFinale, g('tempiConservazione.azioneFinale'), enums.azioneFinale)
  ] });

  // 10 — Misure di sicurezza
  sezioni.push({ id: 'sicurezza', titolo: S.sicurezza, campi: [
    ctlListaBil('misureTecniche', 'misureSicurezza.tecniche', C.misureTecniche, g('misureSicurezza.tecniche'), 'misureTecniche', false),
    ctlListaBil('misureOrganizzative', 'misureSicurezza.organizzative', C.misureOrganizzative, g('misureSicurezza.organizzative'), 'misureOrganizzative', false),
    ctlTestoBil('sicurezzaRinvio', 'misureSicurezza.rinvioDocumentale', C.sicurezzaRinvio, g('misureSicurezza.rinvioDocumentale'), true)
  ] });

  // 11 — Processi automatizzati e profilazione
  sezioni.push({ id: 'automatizzati', titolo: S.automatizzati, campi: [
    ctlBool('pdaPresenti', 'processiDecisionaliAutomatizzati.presenti', C.pdaPresenti, g('processiDecisionaliAutomatizzati.presenti'), [
      ctlTestoBil('pdaDescrizione', 'processiDecisionaliAutomatizzati.descrizione', C.pdaDescrizione, g('processiDecisionaliAutomatizzati.descrizione'), true),
      ctlTestoBil('pdaLogica', 'processiDecisionaliAutomatizzati.logica', C.pdaLogica, g('processiDecisionaliAutomatizzati.logica'), true),
      ctlTestoBil('pdaConseguenze', 'processiDecisionaliAutomatizzati.conseguenze', C.pdaConseguenze, g('processiDecisionaliAutomatizzati.conseguenze'), true),
      ctlTestoBil('pdaDiritti', 'processiDecisionaliAutomatizzati.dirittiInteressato', C.pdaDiritti, g('processiDecisionaliAutomatizzati.dirittiInteressato'), true)
    ]),
    ctlBool('profPresente', 'profilazioneMarketing.presente', C.profPresente, g('profilazioneMarketing.presente'), [
      ctlTestoBil('profDescrizione', 'profilazioneMarketing.descrizione', C.profDescrizione, g('profilazioneMarketing.descrizione'), true),
      ctlTestoBil('profLogica', 'profilazioneMarketing.logica', C.profLogica, g('profilazioneMarketing.logica'), true),
      ctlTestoBil('profBaseGiuridica', 'profilazioneMarketing.baseGiuridicaSpecifica', C.profBaseGiuridica, g('profilazioneMarketing.baseGiuridicaSpecifica'), true)
    ])
  ] });

  // 12 — DPIA e note
  sezioni.push({ id: 'dpiaNote', titolo: S.dpiaNote, campi: [
    ctlBool('dpiaEffettuata', 'valutazioneDiImpatto.effettuata', C.dpiaEffettuata, g('valutazioneDiImpatto.effettuata'), [
      ctlTestoBil('dpiaRiferimento', 'valutazioneDiImpatto.riferimentoDocumento', C.dpiaRiferimento, g('valutazioneDiImpatto.riferimentoDocumento'), false)
    ]),
    ctlTestoBil('note', 'note', C.note, g('note'), true)
  ] });

  // Navigation helpers (CSP: precomputed strings), as in detail.js.
  sezioni.forEach((sez, i) => { sez.ancora = '#edit-' + sez.id; sez.indice = (i + 1) + '. '; sez.aperta = (i === 0); sez.idEdit = 'edit-' + sez.id; });

  return { sezioni, lingue: Array.isArray(lingue) && lingue.length ? [...lingue] : ['it'] };
}

// --- applyEditModel: write controls back onto `record` (a clone), return it ---
function entryDaRiga(riga) {
  const e = {};
  for (const c of riga.campi) {
    if (c.tipo === 'testoBil') e[c.chiave] = { it: c.valIt || '', en: c.valEn || '' };
    else if (c.tipo === 'bool') e[c.chiave] = !!c.val;
    else e[c.chiave] = c.val || '';
  }
  return e;
}
function applyControl(r, c) {
  switch (c.tipo) {
    case 'testoBil': setByPath(r, c.path, { it: c.valIt || '', en: c.valEn || '' }); break;
    case 'piano':    setByPath(r, c.path, c.val || ''); break;
    case 'data':     setByPath(r, c.path, c.val || ''); break;
    case 'enum1':    setByPath(r, c.path, c.val || ''); break;
    case 'enumN':    setByPath(r, c.path, (c.opzioni || []).filter((o) => o.sel).map((o) => o.code)); break;
    case 'bool':
      setByPath(r, c.path, !!c.val);
      if (Array.isArray(c.figli)) for (const f of c.figli) applyControl(r, f);
      break;
    case 'listaBil': setByPath(r, c.path, (c.voci || []).map((v) => ({ it: v.valIt || '', en: v.valEn || '' }))); break;
    case 'gruppi':   setByPath(r, c.path, (c.righe || []).map((rg) => entryDaRiga(rg))); break;
  }
}
export function applyEditModel(record, editModel) {
  const r = record;
  for (const sez of editModel.sezioni) {
    for (const campo of sez.campi) applyControl(r, campo);
  }
  return r;
}

// --- Blank builders for add/remove actions (used by app.js) ---
export function nuovaVoceLista() {
  return { valIt: '', valEn: '' };
}
export function nuovaRigaGruppo(gruppoTipo, { detail, enums, titolo }) {
  if (gruppoTipo === 'responsabiliEsterni') return rigaResponsabile({}, detail, titolo || '');
  if (gruppoTipo === 'trasferimentiExtraUE') return rigaTrasferimento({}, detail, enums, titolo || '');
  if (gruppoTipo === 'unitaOrganizzativa') return rigaUnitaOrganizzativa({}, detail, titolo || '');
  return { rigaTitolo: titolo || '', campi: [] };
}

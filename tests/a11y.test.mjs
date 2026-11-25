/*
 * ropa30 — tests/a11y.test.mjs
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Automated accessibility checks (WCAG 2.1 AA) that can run without a browser:
 *   1. colour contrast of the theme tokens in src/tailwind.css, light and dark
 *      (1.4.3 text >= 4.5:1; 1.4.11 form borders and icons >= 3:1);
 *   2. every form control in public/index.html has an accessible name
 *      (1.3.1, 4.1.2): an id (associated <label for>), an aria-label or
 *      aria-labelledby, or - for checkboxes - an enclosing <label>;
 *   3. every <label for> points to an existing id; every modal dialog has
 *      role="dialog", aria-modal and an aria-labelledby that exists;
 *   4. every editor control carries its precomputed accessible name.
 *
 *   node tests/a11y.test.mjs
 */

import { readFileSync } from 'node:fs';
import localeIt from '../public/locales/it.js';
import localeEn from '../public/locales/en.js';
import { createDefaultProcessingActivity } from '../public/js/schema.js';
import { buildEditModel, nuovaRigaGruppo } from '../public/js/editor.js';

let passed = 0;
let failed = 0;
function check(label, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? '\n       ' + detail : '')); }
}

// ---------------------------------------------------------------------------
// 1. Contrast of the theme tokens
// ---------------------------------------------------------------------------
function oklchToLinearSrgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const clamp = (x) => Math.max(0, Math.min(1, x));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
  ];
}
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function ratio(c1, c2) {
  const [hi, lo] = [luminance(c1), luminance(c2)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
// Alpha blend in gamma-encoded sRGB (as browsers do), returned as linear sRGB.
function blend(fgLin, alpha, bgLin) {
  const enc = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  const dec = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return fgLin.map((f, i) => dec(alpha * enc(f) + (1 - alpha) * enc(bgLin[i])));
}

const css = readFileSync(new URL('../src/tailwind.css', import.meta.url), 'utf8');
const RE = /--color-([a-z]+(?:-\d+)?):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g;
function tokens(text) {
  const out = {};
  for (const m of text.matchAll(RE)) out[m[1]] = oklchToLinearSrgb(+m[2], +m[3], +m[4]);
  return out;
}
const darkStart = css.indexOf('prefers-color-scheme: dark');
const light = { white: [1, 1, 1], ...tokens(css.slice(0, darkStart)) };
const dark = { ...light, ...tokens(css.slice(darkStart, css.indexOf('\n}\n', darkStart))) };

const pairs = [
  // [foreground, background, minimum, use]
  ['brand-900', 'neutral-50', 4.5, 'body text on page'],
  ['brand-900', 'white', 4.5, 'body text on cards'],
  ['brand-800', 'white', 4.5, 'labels'],
  ['brand-700', 'white', 4.5, 'secondary text, outline buttons'],
  ['brand-600', 'white', 4.5, 'links'],
  ['brand-500', 'white', 4.5, 'muted text on cards'],
  ['brand-500', 'neutral-50', 4.5, 'muted text on page'],
  ['brand-500', 'brand-50', 4.5, 'muted text on tinted panels'],
  ['brand-400', 'white', 3, 'form borders and icons on cards'],
  ['brand-400', 'brand-50', 3, 'form borders and icons on tinted panels'],
  ['danger-600', 'white', 4.5, 'error text'],
  ['accent-600', 'white', 4.5, 'success text'],
  ['white', 'brand-700', 4.5, 'primary button text'],
  ['white', 'danger-600', 4.5, 'destructive button text']
];
for (const [name, T] of [['light', light], ['dark', dark]]) {
  console.log(`1. Contrast (${name} theme)`);
  if (!T['neutral-50']) T['neutral-50'] = [0.9822, 0.9822, 0.9822]; // Tailwind default neutral-50 (#fafafa)
  for (const [fg, bg, min, use] of pairs) {
    const r = ratio(T[fg], T[bg]);
    check(`${fg} on ${bg} ${r.toFixed(2)}:1 >= ${min} (${use})`, r >= min);
  }
  const badgeBg = blend(T['warning-500'], 0.2, T.white);
  const r = ratio(T['warning-600'], badgeBg);
  check(`warning-600 on warning badge ${r.toFixed(2)}:1 >= 4.5 (missing-translation badge)`, r >= 4.5);
}

// ---------------------------------------------------------------------------
// 2-3. Accessible names in the markup
// ---------------------------------------------------------------------------
console.log('2. Form controls have an accessible name');
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const labelFor = new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const senzaNome = [];
for (const m of html.matchAll(/<(input|textarea|select)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gs)) {
  const a = m[2];
  if (/type="(hidden|file)"/.test(a)) continue;
  const id = (a.match(/\sid="([^"]+)"/) || [])[1];
  const named = /aria-label(ledby)?=/.test(a) || (id && labelFor.has(id));
  const before = html.slice(Math.max(0, m.index - 400), m.index);
  const wrapped = /type="(checkbox|radio)"/.test(a) && before.lastIndexOf('<label') > before.lastIndexOf('</label>');
  if (!named && !wrapped) senzaNome.push(m[1] + ' ' + ((a.match(/x-model="([^"]+)"/) || [])[1] || id || '?'));
}
check('no unnamed input, select or textarea', senzaNome.length === 0, senzaNome.join(', '));

console.log('3. Labels and dialogs');
const orphan = [...labelFor].filter((f) => !ids.has(f));
check('every <label for> points to an existing id', orphan.length === 0, orphan.join(', '));
const dialogs = [...html.matchAll(/<[a-z]+\b(?:[^>"']|"[^"]*"|'[^']*')*role="dialog"(?:[^>"']|"[^"]*"|'[^']*')*>/gs)].map((m) => m[0]);
check(`${dialogs.length} dialogs found`, dialogs.length >= 10);
const badDialogs = dialogs.filter((d) => {
  const lb = (d.match(/aria-labelledby="([^"]+)"/) || [])[1];
  return !/aria-modal="true"/.test(d) || !lb || !ids.has(lb);
});
check('every dialog has aria-modal and an existing aria-labelledby', badDialogs.length === 0, badDialogs.join('\n       '));
check('collapsible editor sections expose aria-expanded', /x-on:click="toggleSezione"[^>]*aria-expanded/.test(html));
check('status messages are live regions', /x-text="exportMessage"[^>]*role="status"/.test(html) && /x-text="restoreMessage"[^>]*role="status"/.test(html));
check('page language is set and follows the UI language', /<html lang="it"[^>]*x-bind:lang="lang"/.test(html));
check('skip link present', /skipToContent/.test(html));

// ---------------------------------------------------------------------------
// 4. Editor controls carry their accessible names
// ---------------------------------------------------------------------------
console.log('4. Editor controls carry accessible names');
for (const [lang, loc] of [['it', localeIt], ['en', localeEn]]) {
  const deps = { lingue: ['it', 'en'], detail: loc.detail, enums: loc.enums };
  const m = buildEditModel(createDefaultProcessingActivity({ id: 'x' }), deps);
  const mancanti = [];
  const verifica = (c, where) => {
    if (c.isTestoBil || c.isListaBil) {
      if (!c.ariaIt || !c.ariaEn || c.ariaIt.startsWith(' (')) mancanti.push(where + c.chiave);
    } else if (c.isPiano || c.isData || c.isEnum1) {
      if (!c.aria) mancanti.push(where + c.chiave);
    }
    (c.figli || []).forEach((f) => verifica(f, where + c.chiave + '>'));
  };
  for (const sez of m.sezioni) {
    for (const c of sez.campi) {
      verifica(c, '');
      if (c.isGruppi) {
        const riga = nuovaRigaGruppo(c.gruppoTipo, { detail: loc.detail, enums: loc.enums });
        riga.campi.forEach((sc) => verifica(sc, c.chiave + '/'));
      }
    }
  }
  check(`all editor controls named (${lang})`, mancanti.length === 0, mancanti.join(', '));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

// ropa30 — test del modulo crypto/backup-crypto.js (Node >= 20, WebCrypto integrato).
// Uso, dalla root del repo:  node tests/backup-crypto.test.mjs
import {
  encryptEnvelope, decryptEnvelope, isEncryptedEnvelope,
  ENC_FORMAT, PBKDF2_ITERATIONS, MIN_PASSWORD_LENGTH
} from '../public/js/crypto/backup-crypto.js';

let ok = 0, ko = 0;
function check(nome, cond) {
  if (cond) { ok++; console.log('  OK  ', nome); }
  else { ko++; console.log('  FAIL', nome); }
}
async function rifiuta(nome, promessa, codice) {
  try { await promessa; check(`${nome} (atteso ${codice}, nessun errore)`, false); }
  catch (e) { check(`${nome} -> ${e.message}`, e.message === codice); }
}

const envelope = {
  _meta: { app: 'ropa30', exportFormatVersion: 1, exportedAt: '2026-11-24T18:00:00.000Z',
           counts: { settings: 1, processingActivities: 1, auditLog: 0 } },
  data: {
    settings: [{ id: 'main', titolare: { denominazione: 'Studio Àèìòù — Test «ß»' } }],
    processingActivities: [{ id: 'x', nome: { it: 'Newsletter', en: 'Newsletter' } }],
    auditLog: []
  }
};
const PW = 'correct horse battery staple';

console.log('Cifratura...');
const t0 = Date.now();
const enc = await encryptEnvelope(envelope, PW);
console.log(`  (cifratura: ${Date.now() - t0} ms)`);

check('formato dichiarato', enc.format === ENC_FORMAT && isEncryptedEnvelope(enc));
check('iterazioni PBKDF2 = 600000', enc.kdf.iterations === PBKDF2_ITERATIONS);
check('nessun dato in chiaro nel file', !JSON.stringify(enc).includes('Newsletter'));

const t1 = Date.now();
const dec = await decryptEnvelope(enc, PW);
console.log(`  (decifratura: ${Date.now() - t1} ms)`);
check('decifratura = originale', JSON.stringify(dec) === JSON.stringify(envelope));

// Stessa password in forma Unicode diversa (NFD vs NFC) -> stessa chiave
const pwAcc = 'pässwörd-éèàü-2026';
const encAcc = await encryptEnvelope(envelope, pwAcc.normalize('NFC'));
const decAcc = await decryptEnvelope(encAcc, pwAcc.normalize('NFD'));
check('password NFC/NFD equivalenti', JSON.stringify(decAcc) === JSON.stringify(envelope));

// Due cifrature della stessa cosa sono diverse (salt e IV casuali)
const enc2 = await encryptEnvelope(envelope, PW);
check('salt/IV casuali (file diversi)', enc2.ciphertext !== enc.ciphertext && enc2.kdf.salt !== enc.kdf.salt);

console.log('Casi di errore...');
await rifiuta('password sbagliata', decryptEnvelope(enc, PW + 'x'), 'DECRYPT_FAILED');
await rifiuta('password vuota', decryptEnvelope(enc, ''), 'DECRYPT_FAILED');
await rifiuta('password corta in cifratura', encryptEnvelope(envelope, 'x'.repeat(MIN_PASSWORD_LENGTH - 1)), 'PASSWORD_TOO_SHORT');

// Ciphertext alterato di un solo carattere
const tamper = structuredClone(enc);
const i = Math.floor(tamper.ciphertext.length / 2);
const ch = tamper.ciphertext[i] === 'A' ? 'B' : 'A';
tamper.ciphertext = tamper.ciphertext.slice(0, i) + ch + tamper.ciphertext.slice(i + 1);
await rifiuta('ciphertext alterato', decryptEnvelope(tamper, PW), 'DECRYPT_FAILED');

// Parametro dichiarato alterato (dati autenticati): iterazioni modificate
const tamper2 = structuredClone(enc); tamper2.kdf.iterations = 600001;
await rifiuta('iterazioni alterate', decryptEnvelope(tamper2, PW), 'DECRYPT_FAILED');

// Formati non validi
await rifiuta('backup in chiaro passato come cifrato', decryptEnvelope(envelope, PW), 'ENC_FORMAT');
const bad1 = structuredClone(enc); bad1.kdf.iterations = 1e9;
await rifiuta('iterazioni eccessive', decryptEnvelope(bad1, PW), 'ENC_FORMAT');
const bad2 = structuredClone(enc); bad2.kdf.iterations = 1000;
await rifiuta('iterazioni troppo basse', decryptEnvelope(bad2, PW), 'ENC_FORMAT');
const bad3 = structuredClone(enc); bad3.version = 2;
await rifiuta('versione sconosciuta', decryptEnvelope(bad3, PW), 'ENC_FORMAT');
const bad4 = structuredClone(enc); bad4.cipher.iv = '%%%';
await rifiuta('base64 non valido', decryptEnvelope(bad4, PW), 'ENC_FORMAT');

check('isEncryptedEnvelope(backup in chiaro) = false', !isEncryptedEnvelope(envelope));

console.log(`\nRisultato: ${ok} OK, ${ko} FAIL`);
process.exit(ko ? 1 : 0);

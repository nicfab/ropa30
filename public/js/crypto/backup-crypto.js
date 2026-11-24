/*
 * ropa30 — crypto/backup-crypto.js
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Optional password-based encryption of the full backup envelope.
 * WebCrypto only: no libraries, no network, nothing stored.
 *
 *   key  = PBKDF2-HMAC-SHA-256(password, 16-byte random salt, 600 000 iterations)
 *          -> 256-bit AES key (non-extractable)
 *   data = AES-256-GCM(JSON of the backup envelope), 12-byte random IV,
 *          128-bit authentication tag. The declared parameters (format,
 *          version, KDF, cipher) are bound as additional authenticated data:
 *          altering any of them, or a single byte of the ciphertext, makes
 *          decryption fail.
 *
 * The plaintext is the UNCHANGED backup envelope (db.exportAllData()), so
 * after decryption the usual validation (validateBackupEnvelope) and restore
 * (importAllData) apply as for a plain backup.
 *
 * The password is normalised to Unicode NFC, so that the same password typed
 * on different systems yields the same key. It is never stored.
 *
 * Errors are thrown as Error objects whose message is a stable code that the
 * UI can localise:
 *   CRYPTO_UNAVAILABLE  — WebCrypto not available (e.g. insecure context)
 *   PASSWORD_TOO_SHORT  — password shorter than MIN_PASSWORD_LENGTH
 *   ENC_FORMAT          — not a well-formed encrypted backup
 *   DECRYPT_FAILED      — wrong password, or file altered/corrupted
 */

export const ENC_FORMAT = 'ropa30-backup-encrypted';
export const ENC_VERSION = 1;
export const PBKDF2_ITERATIONS = 600000;
export const MIN_PASSWORD_LENGTH = 12;

// Bounds accepted when READING a file: protects against files declaring an
// absurd iteration count (which would freeze the browser) or a weak one.
const MIN_ITERATIONS_ACCEPTED = 100000;
const MAX_ITERATIONS_ACCEPTED = 10000000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function cryptoApi() {
  const c = globalThis.crypto;
  if (!c || !c.subtle || typeof c.getRandomValues !== 'function') {
    throw new Error('CRYPTO_UNAVAILABLE');
  }
  return c;
}

function toB64(bytes) {
  let s = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(s);
}

function fromB64(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function normalizzaPassword(password) {
  return typeof password === 'string' ? password.normalize('NFC') : '';
}

// Deterministic serialisation of the declared parameters, used as AES-GCM
// additional authenticated data (independent of JSON key order in the file).
function datiAutenticati(h) {
  const parts = [
    h.format, h.version,
    h.kdf.name, h.kdf.hash, h.kdf.iterations, h.kdf.salt,
    h.cipher.name, h.cipher.iv
  ];
  return new TextEncoder().encode(parts.join('|'));
}

async function derivaChiave(password, salt, iterations) {
  const { subtle } = cryptoApi();
  const base = await subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// True if the parsed JSON object declares itself as an encrypted backup.
export function isEncryptedEnvelope(obj) {
  return !!obj && typeof obj === 'object' && obj.format === ENC_FORMAT;
}

// Encrypt a backup envelope. Returns the encrypted envelope (a plain object,
// ready to be serialised as JSON).
export async function encryptEnvelope(envelope, password) {
  const pw = normalizzaPassword(password);
  if (pw.length < MIN_PASSWORD_LENGTH) throw new Error('PASSWORD_TOO_SHORT');
  const c = cryptoApi();
  const salt = c.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = c.getRandomValues(new Uint8Array(IV_BYTES));
  const header = {
    format: ENC_FORMAT,
    version: ENC_VERSION,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_ITERATIONS, salt: toB64(salt) },
    cipher: { name: 'AES-GCM', iv: toB64(iv) }
  };
  const key = await derivaChiave(pw, salt, PBKDF2_ITERATIONS);
  const plaintext = new TextEncoder().encode(JSON.stringify(envelope));
  const ct = await c.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: datiAutenticati(header), tagLength: 128 },
    key,
    plaintext
  );
  return { ...header, ciphertext: toB64(new Uint8Array(ct)) };
}

// Check the shape of an encrypted envelope; throws ENC_FORMAT if malformed.
function verificaFormato(enc) {
  const ok =
    isEncryptedEnvelope(enc) &&
    enc.version === ENC_VERSION &&
    enc.kdf && enc.kdf.name === 'PBKDF2' && enc.kdf.hash === 'SHA-256' &&
    Number.isInteger(enc.kdf.iterations) &&
    enc.kdf.iterations >= MIN_ITERATIONS_ACCEPTED &&
    enc.kdf.iterations <= MAX_ITERATIONS_ACCEPTED &&
    typeof enc.kdf.salt === 'string' &&
    enc.cipher && enc.cipher.name === 'AES-GCM' && typeof enc.cipher.iv === 'string' &&
    typeof enc.ciphertext === 'string' && enc.ciphertext.length > 0;
  if (!ok) throw new Error('ENC_FORMAT');
}

// Decrypt an encrypted envelope with the given password. Returns the original
// backup envelope object.
export async function decryptEnvelope(enc, password) {
  verificaFormato(enc);
  const c = cryptoApi();
  let salt, iv, ct;
  try {
    salt = fromB64(enc.kdf.salt);
    iv = fromB64(enc.cipher.iv);
    ct = fromB64(enc.ciphertext);
  } catch (e) {
    throw new Error('ENC_FORMAT');
  }
  if (salt.length < SALT_BYTES || iv.length !== IV_BYTES) throw new Error('ENC_FORMAT');

  const pw = normalizzaPassword(password);
  if (!pw) throw new Error('DECRYPT_FAILED');

  const key = await derivaChiave(pw, salt, enc.kdf.iterations);
  let plain;
  try {
    plain = await c.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: datiAutenticati(enc), tagLength: 128 },
      key,
      ct
    );
  } catch (e) {
    throw new Error('DECRYPT_FAILED');
  }
  try {
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (e) {
    throw new Error('DECRYPT_FAILED');
  }
}

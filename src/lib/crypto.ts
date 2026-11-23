/**
 * AES-GCM helpers for encrypting the user's API key at rest.
 * Uses the Web Crypto API (available in both extension contexts and Node 18+).
 *
 * Callers are responsible for persisting the exported key material alongside
 * the ciphertext. The key is intentionally not stored here so this module
 * stays pure and testable without browser storage.
 */

/** Generate a fresh 256-bit AES-GCM key. */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

/** Export a CryptoKey to a base64 string for persistent storage. */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/** Import a base64 key string back into a CryptoKey. */
export async function importKey(b64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string;         // base64
}

/** Encrypt a UTF-8 plaintext string. Returns base64-encoded ciphertext and IV. */
export async function encrypt(key: CryptoKey, plaintext: string): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(buf))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/** Decrypt an EncryptedPayload back to the original UTF-8 string. */
export async function decrypt(key: CryptoKey, payload: EncryptedPayload): Promise<string> {
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(payload.ciphertext), (c) => c.charCodeAt(0));
  const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(buf);
}

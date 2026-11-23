import { describe, it, expect } from 'vitest';
import {
  generateKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
} from '../../src/lib/crypto';

describe('generateKey', () => {
  it('returns an AES-GCM CryptoKey', async () => {
    const key = await generateKey();
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('produces a unique key each call', async () => {
    const a = await exportKey(await generateKey());
    const b = await exportKey(await generateKey());
    expect(a).not.toBe(b);
  });
});

describe('exportKey / importKey', () => {
  it('round-trips through base64', async () => {
    const key = await generateKey();
    const b64 = await exportKey(key);
    expect(typeof b64).toBe('string');
    expect(b64.length).toBeGreaterThan(0);
    const imported = await importKey(b64);
    expect(imported.type).toBe('secret');
    expect(imported.algorithm.name).toBe('AES-GCM');
  });

  it('imported key can decrypt what the original key encrypted', async () => {
    const key = await generateKey();
    const b64 = await exportKey(key);
    const imported = await importKey(b64);
    const payload = await encrypt(key, 'secret value');
    const plaintext = await decrypt(imported, payload);
    expect(plaintext).toBe('secret value');
  });
});

describe('encrypt / decrypt', () => {
  it('encrypts a string and decrypts it back', async () => {
    const key = await generateKey();
    const payload = await encrypt(key, 'my api key sk-1234');
    expect(typeof payload.ciphertext).toBe('string');
    expect(typeof payload.iv).toBe('string');
    const result = await decrypt(key, payload);
    expect(result).toBe('my api key sk-1234');
  });

  it('ciphertext differs on each call even with the same key and plaintext', async () => {
    const key = await generateKey();
    const a = await encrypt(key, 'same text');
    const b = await encrypt(key, 'same text');
    // Different IV means different ciphertext
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('decrypts an empty string', async () => {
    const key = await generateKey();
    const payload = await encrypt(key, '');
    expect(await decrypt(key, payload)).toBe('');
  });

  it('decrypts a unicode string', async () => {
    const key = await generateKey();
    const text = '日本語テスト 🔑';
    expect(await decrypt(key, await encrypt(key, text))).toBe(text);
  });

  it('throws when decrypting with the wrong key', async () => {
    const key = await generateKey();
    const wrongKey = await generateKey();
    const payload = await encrypt(key, 'secret');
    await expect(decrypt(wrongKey, payload)).rejects.toThrow();
  });

  it('throws when ciphertext is corrupted', async () => {
    const key = await generateKey();
    const payload = await encrypt(key, 'secret');
    await expect(decrypt(key, { ...payload, ciphertext: btoa('garbage') })).rejects.toThrow();
  });
});

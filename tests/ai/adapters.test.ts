import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AICallError } from '../../src/ai/types';
import * as openai from '../../src/ai/adapters/openai';
import * as anthropic from '../../src/ai/adapters/anthropic';
import * as gemini from '../../src/ai/adapters/gemini';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
}

function fail(status: number, body: unknown = {}) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) });
}

/* ── OpenAI ── */

describe('openai.generate', () => {
  it('returns the text content from choices', async () => {
    mockFetch.mockReturnValueOnce(ok({ choices: [{ message: { content: 'hello world' } }] }));
    const result = await openai.generate('prompt', 'gpt-4o', 'sk-test');
    expect(result).toBe('hello world');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws AICallError with invalid_key on 401', async () => {
    mockFetch.mockReturnValueOnce(
      fail(401, { error: { message: 'Invalid API key' } }),
    );
    const err = await openai.generate('p', 'gpt-4o', 'bad').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AICallError);
    expect((err as AICallError).aiError.code).toBe('invalid_key');
  });

  it('throws AICallError with quota on 429', async () => {
    mockFetch.mockReturnValueOnce(fail(429, { error: { message: 'rate limit' } }));
    const err = await openai.generate('p', 'gpt-4o', 'k').catch((e: AICallError) => e);
    expect((err as AICallError).aiError.code).toBe('quota');
  });

  it('throws AICallError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'));
    await expect(openai.generate('p', 'gpt-4o', 'k')).rejects.toBeInstanceOf(AICallError);
  });
});

describe('openai.validateKey', () => {
  it('returns true when the models endpoint responds ok', async () => {
    mockFetch.mockReturnValueOnce(ok({}));
    expect(await openai.validateKey('sk-valid')).toBe(true);
  });

  it('returns false on 401', async () => {
    mockFetch.mockReturnValueOnce(fail(401));
    expect(await openai.validateKey('sk-bad')).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    expect(await openai.validateKey('sk-bad')).toBe(false);
  });
});

/* ── Anthropic ── */

describe('anthropic.generate', () => {
  it('returns text from the first text content block', async () => {
    mockFetch.mockReturnValueOnce(
      ok({ content: [{ type: 'text', text: 'response text' }] }),
    );
    const result = await anthropic.generate('prompt', 'claude-haiku-4-5-20251001', 'sk-ant');
    expect(result).toBe('response text');
    const call = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(call[1].headers).toMatchObject({ 'x-api-key': 'sk-ant', 'anthropic-version': '2023-06-01' });
  });

  it('throws AICallError on 401', async () => {
    mockFetch.mockReturnValueOnce(fail(401, { error: { message: 'invalid key' } }));
    await expect(anthropic.generate('p', 'model', 'bad')).rejects.toBeInstanceOf(AICallError);
  });

  it('throws AICallError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const err = await anthropic.generate('p', 'model', 'k').catch((e: AICallError) => e);
    expect((err as AICallError).aiError.code).toBe('network');
  });
});

describe('anthropic.validateKey', () => {
  it('returns true on 200', async () => {
    mockFetch.mockReturnValueOnce(ok({ content: [{ type: 'text', text: 'hi' }] }));
    expect(await anthropic.validateKey('sk-valid')).toBe(true);
  });

  it('returns true on 400 (key valid but bad request shape)', async () => {
    mockFetch.mockReturnValueOnce(fail(400));
    expect(await anthropic.validateKey('sk-valid')).toBe(true);
  });

  it('returns false on 401', async () => {
    mockFetch.mockReturnValueOnce(fail(401));
    expect(await anthropic.validateKey('sk-bad')).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    expect(await anthropic.validateKey('sk-bad')).toBe(false);
  });
});

/* ── Gemini ── */

describe('gemini.generate', () => {
  it('returns text from the first candidate part', async () => {
    mockFetch.mockReturnValueOnce(
      ok({ candidates: [{ content: { parts: [{ text: 'gemini reply' }] }, finishReason: 'STOP' }] }),
    );
    const result = await gemini.generate('prompt', 'gemini-2.0-flash', 'AIza-test');
    expect(result).toBe('gemini reply');
    const url = (mockFetch.mock.calls[0] as [string])[0];
    expect(url).toContain('gemini-2.0-flash:generateContent');
    expect(url).toContain('key=AIza-test');
  });

  it('throws AICallError on 429', async () => {
    mockFetch.mockReturnValueOnce(fail(429, { error: { message: 'quota' } }));
    const err = await gemini.generate('p', 'model', 'k').catch((e: AICallError) => e);
    expect((err as AICallError).aiError.code).toBe('quota');
  });

  it('throws AICallError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'));
    await expect(gemini.generate('p', 'model', 'k')).rejects.toBeInstanceOf(AICallError);
  });
});

describe('gemini.validateKey', () => {
  it('returns true when models endpoint responds ok', async () => {
    mockFetch.mockReturnValueOnce(ok({ models: [] }));
    expect(await gemini.validateKey('AIza-valid')).toBe(true);
  });

  it('returns false on 403', async () => {
    mockFetch.mockReturnValueOnce(fail(403));
    expect(await gemini.validateKey('AIza-bad')).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    expect(await gemini.validateKey('AIza-bad')).toBe(false);
  });
});

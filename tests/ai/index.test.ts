import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { generateText, generateJSON, validateKey } from '../../src/ai/index';
import { AICallError } from '../../src/ai/types';
import type { AIConfig } from '../../src/ai/types';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const cfg: AIConfig = { provider: 'openai', apiKey: 'sk-test', tier: 'fast' };

function openAIResponse(text: string) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ choices: [{ message: { content: text } }] }),
  });
}

function openAIError(status: number, message = 'error') {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: { message } }),
  });
}

/* ── generateText ── */

describe('generateText', () => {
  it('returns text from the adapter', async () => {
    mockFetch.mockReturnValueOnce(openAIResponse('some output'));
    const result = await generateText('my prompt', cfg);
    expect(result).toBe('some output');
  });

  it('re-throws AICallError from the adapter', async () => {
    mockFetch.mockReturnValueOnce(openAIError(401));
    await expect(generateText('p', cfg)).rejects.toBeInstanceOf(AICallError);
  });

  it('wraps non-AICallError in AICallError', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'));
    const err = await generateText('p', cfg).catch((e) => e);
    expect(err).toBeInstanceOf(AICallError);
  });

  it('selects the correct model for the tier', async () => {
    mockFetch.mockReturnValueOnce(openAIResponse('ok'));
    await generateText('p', { ...cfg, tier: 'smart' });
    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string) as { model: string };
    expect(body.model).toBe('gpt-4o');
  });
});

/* ── generateJSON ── */

const thingSchema = z.object({ name: z.string() });

describe('generateJSON', () => {
  it('parses and validates a valid JSON response', async () => {
    mockFetch.mockReturnValueOnce(openAIResponse('{"name":"Alice"}'));
    const result = await generateJSON('p', thingSchema, cfg);
    expect(result).toEqual({ name: 'Alice' });
  });

  it('strips markdown fences before parsing', async () => {
    mockFetch.mockReturnValueOnce(openAIResponse('```json\n{"name":"Bob"}\n```'));
    const result = await generateJSON('p', thingSchema, cfg);
    expect(result).toEqual({ name: 'Bob' });
  });

  it('strips plain fences before parsing', async () => {
    mockFetch.mockReturnValueOnce(openAIResponse('```\n{"name":"Carol"}\n```'));
    const result = await generateJSON('p', thingSchema, cfg);
    expect(result).toEqual({ name: 'Carol' });
  });

  it('retries once on invalid JSON and returns the retry result', async () => {
    mockFetch
      .mockReturnValueOnce(openAIResponse('not json at all'))
      .mockReturnValueOnce(openAIResponse('{"name":"Dave"}'));
    const result = await generateJSON('p', thingSchema, cfg);
    expect(result).toEqual({ name: 'Dave' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries once on schema mismatch and returns the retry result', async () => {
    mockFetch
      .mockReturnValueOnce(openAIResponse('{"wrong":"field"}'))
      .mockReturnValueOnce(openAIResponse('{"name":"Eve"}'));
    const result = await generateJSON('p', thingSchema, cfg);
    expect(result).toEqual({ name: 'Eve' });
  });

  it('throws AICallError after both attempts fail', async () => {
    mockFetch
      .mockReturnValueOnce(openAIResponse('bad'))
      .mockReturnValueOnce(openAIResponse('also bad'));
    const err = await generateJSON('p', thingSchema, cfg).catch((e) => e);
    expect(err).toBeInstanceOf(AICallError);
    expect((err as AICallError).aiError.code).toBe('unknown');
  });

  it('propagates adapter AICallError without retrying it', async () => {
    mockFetch.mockReturnValueOnce(openAIError(401));
    await expect(generateJSON('p', thingSchema, cfg)).rejects.toBeInstanceOf(AICallError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

/* ── validateKey ── */

describe('validateKey', () => {
  it('returns true when the adapter accepts the key', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }),
    );
    expect(await validateKey('openai', 'sk-valid')).toBe(true);
  });

  it('returns false when the adapter rejects the key', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) }),
    );
    expect(await validateKey('openai', 'sk-bad')).toBe(false);
  });
});

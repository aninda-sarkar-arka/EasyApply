import { describe, it, expect } from 'vitest';
import { toAIError, AICallError } from '../../src/ai/types';

describe('AICallError', () => {
  it('sets name and aiError', () => {
    const err = new AICallError({ code: 'unknown', message: 'boom', status: 500 });
    expect(err.name).toBe('AICallError');
    expect(err.message).toBe('boom');
    expect(err.aiError.code).toBe('unknown');
  });
});

describe('toAIError', () => {
  it('passes through an existing AICallError unchanged', () => {
    const inner = new AICallError({ code: 'quota', message: 'rate limited', status: 429 });
    const result = toAIError(inner, 'openai');
    expect(result).toBe(inner.aiError);
  });

  it('maps 429 status to quota error', () => {
    const result = toAIError({ status: 429, message: 'too many requests' }, 'openai');
    expect(result.code).toBe('quota');
    expect(result.status).toBe(429);
  });

  it('maps "rate limit" message to quota error', () => {
    const result = toAIError(new Error('rate limit exceeded'), 'gemini');
    expect(result.code).toBe('quota');
  });

  it('maps 401 status to invalid_key error', () => {
    const result = toAIError({ status: 401, message: 'Unauthorized' }, 'anthropic');
    expect(result.code).toBe('invalid_key');
    expect(result.status).toBe(401);
  });

  it('maps "invalid api key" message to invalid_key error', () => {
    const result = toAIError(new Error('invalid api key provided'), 'openai');
    expect(result.code).toBe('invalid_key');
  });

  it('maps "fetch failed" message to network error', () => {
    const result = toAIError(new Error('fetch failed'), 'openai');
    expect(result.code).toBe('network');
    expect(result.status).toBe(0);
  });

  it('maps ECONNREFUSED to network error', () => {
    const result = toAIError(new Error('ECONNREFUSED'), 'gemini');
    expect(result.code).toBe('network');
  });

  it('maps unknown errors to unknown code', () => {
    const result = toAIError(new Error('something went wrong'), 'openai');
    expect(result.code).toBe('unknown');
    expect(result.status).toBe(500);
    expect(result.message).toBe('something went wrong');
  });

  it('handles non-Error thrown values', () => {
    const result = toAIError('plain string error', 'openai');
    expect(result.code).toBe('unknown');
    expect(result.message).toBe('plain string error');
  });
});

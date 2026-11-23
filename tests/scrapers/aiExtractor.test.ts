import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiExtractJobDetails, getPageText } from '../../src/scrapers/linkedin/aiExtractor';
import type { AIConfig } from '../../src/ai/types';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  document.body.innerHTML = '';
  // jsdom innerText assignments persist through innerHTML resets; clear explicitly
  document.body.innerText = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

const cfg: AIConfig = { provider: 'openai', apiKey: 'sk-test', tier: 'fast' };

function openAIResponse(text: string) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ choices: [{ message: { content: text } }] }),
  });
}

describe('aiExtractJobDetails', () => {
  it('calls the AI layer and returns parsed job fields', async () => {
    mockFetch.mockReturnValueOnce(
      openAIResponse(JSON.stringify({ role: 'Staff Engineer', company: 'Acme', location: 'Remote' })),
    );
    const result = await aiExtractJobDetails('some page text about a job', cfg);
    expect(result.role).toBe('Staff Engineer');
    expect(result.company).toBe('Acme');
    expect(result.location).toBe('Remote');
  });

  it('accepts null location from the AI response', async () => {
    mockFetch.mockReturnValueOnce(
      openAIResponse(JSON.stringify({ role: 'Analyst', company: 'Corp', location: null })),
    );
    const result = await aiExtractJobDetails('text', cfg);
    expect(result.location).toBeNull();
  });

  it('propagates AICallError when the adapter fails', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: { message: 'bad key' } }) }),
    );
    await expect(aiExtractJobDetails('text', cfg)).rejects.toThrow();
  });
});

describe('getPageText', () => {
  it('returns visible body text', () => {
    document.body.innerText = 'Senior Engineer at Acme Corp';
    expect(getPageText()).toContain('Senior Engineer at Acme Corp');
  });

  it('caps output at 4000 characters', () => {
    document.body.innerText = 'x'.repeat(5000);
    expect(getPageText().length).toBe(4000);
  });

  it('returns empty string when body has no text', () => {
    expect(getPageText()).toBe('');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractJobDetails, extractJobDetailsWithFallback } from '../../src/scrapers/linkedin/extractor';
import type { AIConfig } from '../../src/ai/types';

const mockFetch = vi.fn();

beforeEach(() => {
  document.body.innerHTML = '';
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  // Vitest/jsdom doesn't set window.location, so we mock it via a getter override.
  Object.defineProperty(window, 'location', {
    value: { href: 'https://www.linkedin.com/jobs/view/1234567890/' },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('extractJobDetails', () => {
  it('returns the job ID passed in', () => {
    const result = extractJobDetails('1234567890');
    expect(result.linkedInJobId).toBe('1234567890');
  });

  it('extracts job title from a matching selector', () => {
    document.body.innerHTML = `
      <h1 class="t-24 t-bold inline">Senior Software Engineer</h1>
    `;
    const result = extractJobDetails('1234567890');
    expect(result.role).toBe('Senior Software Engineer');
  });

  it('extracts company from a matching selector', () => {
    document.body.innerHTML = `
      <a class="topcard__org-name-link">Acme Corp</a>
    `;
    const result = extractJobDetails('1234567890');
    expect(result.company).toBe('Acme Corp');
  });

  it('returns empty strings for role and company when nothing matches', () => {
    const result = extractJobDetails('1234567890');
    expect(result.role).toBe('');
    expect(result.company).toBe('');
  });

  it('returns null for location when nothing matches', () => {
    const result = extractJobDetails('1234567890');
    expect(result.location).toBeNull();
  });

  it('returns the current href as jobLink', () => {
    const result = extractJobDetails('1234567890');
    expect(result.jobLink).toBe('https://www.linkedin.com/jobs/view/1234567890/');
  });
});

/* ── extractJobDetailsWithFallback ── */

const cfg: AIConfig = { provider: 'openai', apiKey: 'sk-test', tier: 'fast' };

function openAIResponse(text: string) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ choices: [{ message: { content: text } }] }),
  });
}

describe('extractJobDetailsWithFallback', () => {
  it('returns DOM result when DOM extraction succeeds', async () => {
    document.body.innerHTML = `
      <h1 class="t-24 t-bold inline">Backend Engineer</h1>
      <a class="topcard__org-name-link">TechCo</a>
    `;
    const result = await extractJobDetailsWithFallback('42', cfg);
    expect(result.role).toBe('Backend Engineer');
    expect(result.company).toBe('TechCo');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls AI fallback when both company and role are empty', async () => {
    mockFetch.mockReturnValueOnce(
      openAIResponse(JSON.stringify({ role: 'AI Engineer', company: 'AI Corp', location: 'Remote' })),
    );
    const result = await extractJobDetailsWithFallback('42', cfg);
    expect(result.role).toBe('AI Engineer');
    expect(result.company).toBe('AI Corp');
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('returns empty base result when AI also fails and no config provided', async () => {
    // No DOM content, no config: should return base without attempting AI
    const result = await extractJobDetailsWithFallback('42');
    expect(result.role).toBe('');
    expect(result.company).toBe('');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('falls back to DOM result silently when the AI call throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    const result = await extractJobDetailsWithFallback('42', cfg);
    expect(result.role).toBe('');
    expect(result.company).toBe('');
  });

  it('merges AI-provided location into base result', async () => {
    mockFetch.mockReturnValueOnce(
      openAIResponse(JSON.stringify({ role: 'DevOps', company: 'Ops Inc', location: 'Sydney' })),
    );
    const result = await extractJobDetailsWithFallback('42', cfg);
    expect(result.location).toBe('Sydney');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractJobDetails } from '../../src/scrapers/linkedin/extractor';

beforeEach(() => {
  document.body.innerHTML = '';
  // Vitest/jsdom doesn't set window.location, so we mock it via a getter override.
  Object.defineProperty(window, 'location', {
    value: { href: 'https://www.linkedin.com/jobs/view/1234567890/' },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  document.body.innerHTML = '';
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

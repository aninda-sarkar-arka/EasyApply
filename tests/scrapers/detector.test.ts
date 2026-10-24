import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractJobIdFromUrl, isSuccessModalVisible } from '../../src/scrapers/linkedin/detector';

describe('extractJobIdFromUrl', () => {
  it('extracts job ID from /jobs/view/ path', () => {
    expect(extractJobIdFromUrl('https://www.linkedin.com/jobs/view/3987654321/')).toBe('3987654321');
  });

  it('extracts job ID from /jobs/view/ path with query string', () => {
    expect(extractJobIdFromUrl('https://www.linkedin.com/jobs/view/1234567890?refId=abc')).toBe('1234567890');
  });

  it('extracts job ID from currentJobId query param', () => {
    expect(
      extractJobIdFromUrl(
        'https://www.linkedin.com/jobs/collections/recommended/?currentJobId=9876543210',
      ),
    ).toBe('9876543210');
  });

  it('extracts job ID from currentJobId in a multi-param query', () => {
    expect(
      extractJobIdFromUrl(
        'https://www.linkedin.com/jobs/search/?keywords=engineer&currentJobId=5551234567&location=Sydney',
      ),
    ).toBe('5551234567');
  });

  it('returns null for a non-job LinkedIn URL', () => {
    expect(extractJobIdFromUrl('https://www.linkedin.com/feed/')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractJobIdFromUrl('')).toBeNull();
  });
});

describe('isSuccessModalVisible', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns false when the DOM is empty', () => {
    expect(isSuccessModalVisible()).toBe(false);
  });

  it('returns true when a dialog with success text is present', () => {
    document.body.innerHTML = `
      <div role="dialog">
        <h2>Your application was sent to Acme Corp</h2>
      </div>
    `;
    expect(isSuccessModalVisible()).toBe(true);
  });

  it('returns true when an aria-label match is present', () => {
    document.body.innerHTML = `
      <div aria-label="Application submitted to Acme"></div>
    `;
    expect(isSuccessModalVisible()).toBe(true);
  });

  it('returns false when only a non-success dialog is present', () => {
    document.body.innerHTML = `
      <div role="dialog">
        <h2>Start your application at Acme Corp</h2>
      </div>
    `;
    expect(isSuccessModalVisible()).toBe(false);
  });
});

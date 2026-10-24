import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractJobIdFromUrl, isSuccessModalVisible, isEasyApplyJob, watchExternalApply } from '../../src/scrapers/linkedin/detector';

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

describe('isEasyApplyJob', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('returns false when the DOM is empty', () => {
    expect(isEasyApplyJob()).toBe(false);
  });

  it('returns true when an Easy Apply button is present', () => {
    document.body.innerHTML = `<button aria-label="Easy Apply at Acme">Easy Apply</button>`;
    expect(isEasyApplyJob()).toBe(true);
  });

  it('returns false when only an external Apply button is present', () => {
    document.body.innerHTML = `<button aria-label="Apply at Acme">Apply</button>`;
    expect(isEasyApplyJob()).toBe(false);
  });
});

describe('watchExternalApply', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('calls callback when the external Apply button is clicked', () => {
    document.body.innerHTML = `<button aria-label="Apply at Acme Corp">Apply</button>`;
    let called = '';
    const stop = watchExternalApply('job123', (id) => { called = id; });
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(called).toBe('job123');
    stop();
  });

  it('returns a no-op cleanup when no external Apply button is found', () => {
    expect(() => watchExternalApply('job123', () => undefined)()).not.toThrow();
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

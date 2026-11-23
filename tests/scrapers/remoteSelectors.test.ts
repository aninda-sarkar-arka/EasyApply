import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  refreshRemoteSelectors,
  loadCachedSelectors,
  REMOTE_SELECTORS_URL,
} from '../../src/scrapers/linkedin/remoteSelectors';
import { getSelectors, resetSelectors } from '../../src/scrapers/linkedin/selectorStore';
import { selectors as bundled } from '../../src/scrapers/linkedin/selectors';

const mockFetch = vi.fn();
const storageData: Record<string, unknown> = {};

const mockStorage = {
  get: vi.fn(async (key: string) => ({ [key]: storageData[key] })),
  set: vi.fn(async (obj: Record<string, unknown>) => { Object.assign(storageData, obj); }),
};

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  vi.stubGlobal('browser', { storage: { local: mockStorage } });
  mockFetch.mockReset();
  mockStorage.get.mockClear();
  mockStorage.set.mockClear();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
  resetSelectors();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetSelectors();
});

const validConfig = {
  jobTitle: ['.remote-title'],
  company: ['.remote-company'],
  location: ['.remote-location'],
  easyApplyButton: ['button.remote-easy'],
  externalApplyButton: ['button.remote-ext'],
  successModal: ['.remote-modal'],
  successModalText: ['Remote success'],
};

function okResponse(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
}

/* ── refreshRemoteSelectors ── */

describe('refreshRemoteSelectors', () => {
  it('fetches from the expected URL', async () => {
    mockFetch.mockReturnValueOnce(okResponse(validConfig));
    await refreshRemoteSelectors();
    expect(mockFetch).toHaveBeenCalledWith(REMOTE_SELECTORS_URL);
  });

  it('applies the remote config when the response is valid', async () => {
    mockFetch.mockReturnValueOnce(okResponse(validConfig));
    await refreshRemoteSelectors();
    expect(getSelectors().jobTitle).toEqual(['.remote-title']);
  });

  it('caches the config in browser.storage.local', async () => {
    mockFetch.mockReturnValueOnce(okResponse(validConfig));
    await refreshRemoteSelectors();
    expect(mockStorage.set).toHaveBeenCalledOnce();
    const stored = (mockStorage.set.mock.calls[0] as [Record<string, unknown>])[0];
    const entry = stored['remoteSelectors'] as { config: unknown; fetchedAt: number };
    expect(entry.config).toMatchObject(validConfig);
    expect(typeof entry.fetchedAt).toBe('number');
  });

  it('fails silently when the network response is not ok', async () => {
    mockFetch.mockReturnValueOnce(Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) }));
    await expect(refreshRemoteSelectors()).resolves.toBeUndefined();
    expect(getSelectors().jobTitle).toEqual(bundled.jobTitle); // unchanged
  });

  it('fails silently when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));
    await expect(refreshRemoteSelectors()).resolves.toBeUndefined();
  });

  it('fails silently when the response JSON is invalid (missing field)', async () => {
    mockFetch.mockReturnValueOnce(okResponse({ jobTitle: ['.t'] /* missing other required keys */ }));
    await expect(refreshRemoteSelectors()).resolves.toBeUndefined();
    expect(getSelectors().jobTitle).toEqual(bundled.jobTitle);
  });

  it('fails silently when a selector array is empty', async () => {
    mockFetch.mockReturnValueOnce(okResponse({ ...validConfig, jobTitle: [] }));
    await expect(refreshRemoteSelectors()).resolves.toBeUndefined();
    expect(getSelectors().jobTitle).toEqual(bundled.jobTitle);
  });
});

/* ── loadCachedSelectors ── */

describe('loadCachedSelectors', () => {
  it('applies a fresh cached config', async () => {
    storageData['remoteSelectors'] = { config: validConfig, fetchedAt: Date.now() };
    await loadCachedSelectors();
    expect(getSelectors().jobTitle).toEqual(['.remote-title']);
  });

  it('ignores a stale cached entry (older than 24 h)', async () => {
    const msAgo = 25 * 60 * 60 * 1000; // 25 hours
    storageData['remoteSelectors'] = { config: validConfig, fetchedAt: Date.now() - msAgo };
    await loadCachedSelectors();
    expect(getSelectors().jobTitle).toEqual(bundled.jobTitle); // unchanged
  });

  it('does nothing when there is no cached entry', async () => {
    await loadCachedSelectors();
    expect(getSelectors().jobTitle).toEqual(bundled.jobTitle);
  });

  it('fails silently when storage throws', async () => {
    mockStorage.get.mockRejectedValueOnce(new Error('storage error'));
    await expect(loadCachedSelectors()).resolves.toBeUndefined();
  });
});

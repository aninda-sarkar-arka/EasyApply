import { z } from 'zod';
import { setSelectors, type SelectorConfig } from './selectorStore';

/**
 * Remote URL for the selector config JSON. Points to a file in the public
 * repo so selectors can be updated without shipping a new extension version.
 * Update this constant when the repo URL is known.
 */
export const REMOTE_SELECTORS_URL =
  'https://raw.githubusercontent.com/aninda-sarkar-arka/easyapply/main/public/selectors.json';

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = 'remoteSelectors';

const strArr = z.array(z.string()).min(1);
const selectorConfigSchema = z.object({
  jobTitle: strArr,
  company: strArr,
  location: strArr,
  easyApplyButton: strArr,
  externalApplyButton: strArr,
  successModal: strArr,
  successModalText: strArr,
});

interface CachedEntry {
  config: SelectorConfig;
  fetchedAt: number;
}

/**
 * Fetch the latest selector config from the remote URL and cache it in
 * browser.storage.local. Fails silently so the bundled defaults remain active
 * if the network is unavailable or the response is malformed.
 */
export async function refreshRemoteSelectors(): Promise<void> {
  try {
    const res = await fetch(REMOTE_SELECTORS_URL);
    if (!res.ok) return;
    const json: unknown = await res.json();
    const parsed = selectorConfigSchema.safeParse(json);
    if (!parsed.success) return;
    const entry: CachedEntry = { config: parsed.data as SelectorConfig, fetchedAt: Date.now() };
    await browser.storage.local.set({ [CACHE_KEY]: entry });
    setSelectors(entry.config);
  } catch {
    // fail silently
  }
}

/**
 * Read a previously cached selector config from browser.storage.local and
 * apply it if it exists and has not expired. Called by the content script on
 * startup so it uses fresh selectors without a blocking network request.
 */
export async function loadCachedSelectors(): Promise<void> {
  try {
    const result = await browser.storage.local.get(CACHE_KEY);
    const entry = result[CACHE_KEY] as CachedEntry | undefined;
    if (!entry) return;
    if (Date.now() - entry.fetchedAt > TTL_MS) return; // stale
    setSelectors(entry.config);
  } catch {
    // fail silently
  }
}

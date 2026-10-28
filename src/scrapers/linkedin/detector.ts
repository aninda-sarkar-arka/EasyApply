import { getSelectors } from './selectorStore';

/** Extract the LinkedIn job ID from a URL string. Returns null if not found. */
export function extractJobIdFromUrl(url: string): string | null {
  // /jobs/view/1234567890/ or /jobs/view/1234567890?...
  const viewMatch = /\/jobs\/view\/(\d+)/.exec(url);
  if (viewMatch?.[1]) return viewMatch[1];

  // ?currentJobId=1234567890 or &currentJobId=1234567890
  const paramMatch = /[?&]currentJobId=(\d+)/.exec(url);
  if (paramMatch?.[1]) return paramMatch[1];

  return null;
}

/**
 * Watch for SPA navigations on LinkedIn. Calls `callback` whenever the
 * job ID in the URL changes. Returns a cleanup function.
 */
export function watchNavigation(callback: (jobId: string) => void): () => void {
  let lastJobId: string | null = null;

  function checkUrl() {
    const jobId = extractJobIdFromUrl(window.location.href);
    if (jobId && jobId !== lastJobId) {
      lastJobId = jobId;
      callback(jobId);
    }
  }

  // Intercept pushState / replaceState so SPA navigations trigger the check.
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    origPush(...args);
    checkUrl();
  };
  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    origReplace(...args);
    checkUrl();
  };

  window.addEventListener('popstate', checkUrl);
  checkUrl(); // check immediately on load

  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', checkUrl);
  };
}

/**
 * Watch for any Apply-related button click using capture-phase event delegation.
 * Matches "Easy Apply", "Apply", "Apply to job" etc. — but not "Apply filters"
 * or "Applied" status labels. Fires once then removes itself.
 */
export function watchAnyApplyClick(jobId: string, callback: (jobId: string) => void): () => void {
  function handler(e: Event) {
    const target = (e.target as Element).closest('button, a');
    if (!target) return;
    const raw = (target.getAttribute('aria-label') ?? target.textContent ?? '').trim();
    const label = raw.toLowerCase();
    if (
      label.includes('apply') &&
      !label.includes('filter') &&
      !label.startsWith('applied')
    ) {
      cleanup();
      callback(jobId);
    }
  }
  document.body.addEventListener('click', handler, true);
  function cleanup() {
    document.body.removeEventListener('click', handler, true);
  }
  return cleanup;
}

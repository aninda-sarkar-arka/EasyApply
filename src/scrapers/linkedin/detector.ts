import { selectors } from './selectors';

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
 * Watch for the Easy Apply success modal to appear for `jobId`.
 * Uses a MutationObserver on document.body. Calls `callback` once on first
 * detection and then stops watching. Returns a cleanup function.
 */
export function watchSuccessModal(jobId: string, callback: (jobId: string) => void): () => void {
  const observer = new MutationObserver(() => {
    if (isSuccessModalVisible()) {
      observer.disconnect();
      callback(jobId);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Check immediately in case the modal is already in the DOM.
  if (isSuccessModalVisible()) {
    observer.disconnect();
    callback(jobId);
  }

  return () => observer.disconnect();
}

/**
 * Returns true if the current job page has an Easy Apply button (LinkedIn modal flow).
 * When false, an external Apply button may be present instead.
 */
export function isEasyApplyJob(): boolean {
  return selectors.easyApplyButton.some((s) => Boolean(document.querySelector(s)));
}

/**
 * Attach a one-shot click listener to the external Apply button.
 * Calls `callback` when the user clicks Apply, then removes the listener.
 * Returns a cleanup function that removes the listener early.
 * If no external Apply button is found, returns a no-op cleanup.
 */
export function watchExternalApply(jobId: string, callback: (jobId: string) => void): () => void {
  let el: Element | null = null;
  for (const selector of selectors.externalApplyButton) {
    el = document.querySelector(selector);
    if (el) break;
  }
  if (!el) return () => undefined;

  function onClick() {
    cleanup();
    callback(jobId);
  }
  el.addEventListener('click', onClick);

  function cleanup() {
    el?.removeEventListener('click', onClick);
  }
  return cleanup;
}

/** Returns true if the Easy Apply success modal is currently visible. */
export function isSuccessModalVisible(): boolean {
  for (const selector of selectors.successModal) {
    if (document.querySelector(selector)) return true;
  }
  // Fallback: scan dialogs for known success text.
  const dialogs = document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="artdeco-modal"]');
  for (const el of dialogs) {
    const text = el.textContent ?? '';
    for (const pattern of selectors.successModalText) {
      if (text.includes(pattern)) return true;
    }
  }
  return false;
}

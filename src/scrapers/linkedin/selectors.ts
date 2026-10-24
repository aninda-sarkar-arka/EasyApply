/**
 * Selector fallback chains for LinkedIn DOM elements.
 * LinkedIn obfuscates class names frequently. Each array is tried in order;
 * the first match wins. Update here without touching logic files.
 */
export const selectors = {
  jobTitle: [
    'h1.t-24.t-bold.inline',
    'h1[class*="top-card-layout__title"]',
    'h1[class*="job-details-jobs-unified-top-card__job-title"]',
    '.job-details-jobs-unified-top-card__job-title h1',
    'h1',
  ],

  company: [
    '.job-details-jobs-unified-top-card__company-name a',
    'a[class*="topcard__org-name-link"]',
    '.topcard__org-name-link',
    '[data-tracking-control-name="public_jobs_topcard-org-name"]',
    '.job-details-jobs-unified-top-card__primary-description a',
  ],

  location: [
    '.job-details-jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
    '[class*="top-card-layout__bullet"]',
    '.job-details-jobs-unified-top-card__primary-description .tvm__text',
  ],

  /** Selectors that indicate the Easy Apply success modal is visible. */
  successModal: [
    '[aria-label*="Application submitted"]',
    '[aria-label*="applied to"]',
    '[data-test-modal-id="easy-apply-success-modal"]',
  ],

  /** Text patterns to match anywhere inside a visible dialog when selector-based detection fails. */
  successModalText: [
    'Your application was sent',
    'Application submitted',
    'application was sent to',
    'You applied',
  ],
} as const;

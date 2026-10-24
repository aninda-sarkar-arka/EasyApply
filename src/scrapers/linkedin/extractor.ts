import { selectors } from './selectors';

export interface ExtractedJob {
  linkedInJobId: string;
  company: string;
  role: string;
  jobLink: string;
  location: string | null;
}

/**
 * Extract job details from the current LinkedIn job page DOM.
 * Falls back to empty strings for required fields when nothing is found,
 * so callers always get a usable object.
 */
export function extractJobDetails(jobId: string): ExtractedJob {
  return {
    linkedInJobId: jobId,
    role: queryText(selectors.jobTitle) ?? '',
    company: queryText(selectors.company) ?? '',
    location: queryText(selectors.location),
    jobLink: window.location.href,
  };
}

/** Try each selector in order and return the trimmed text of the first match. */
function queryText(candidates: readonly string[]): string | null {
  for (const selector of candidates) {
    const el = document.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

import type { AIConfig } from '../../ai/types';
import { aiExtractJobDetails, getPageText } from './aiExtractor';
import { getSelectors } from './selectorStore';

export interface ExtractedJob {
  linkedInJobId: string;
  company: string;
  role: string;
  jobLink: string;
  location: string | null;
}

/**
 * Extract job details from the current LinkedIn job page DOM.
 * Falls back to page title parsing ("Role | Company | LinkedIn") when
 * DOM selectors return nothing, so callers always get a usable object.
 */
export function extractJobDetails(jobId: string): ExtractedJob {
  const s = getSelectors();
  const title = extractFromPageTitle();
  return {
    linkedInJobId: jobId,
    role: queryText(s.jobTitle) ?? title.role,
    company: queryText(s.company) ?? title.company,
    location: queryText(s.location),
    jobLink: window.location.href,
  };
}

/** Parse role and company from the LinkedIn page title ("Role | Company | LinkedIn"). */
function extractFromPageTitle(): { role: string; company: string } {
  const parts = document.title.split(' | ');
  // LinkedIn format has at least 3 parts when on a job listing
  if (parts.length >= 3) {
    return { role: parts[0]?.trim() ?? '', company: parts[1]?.trim() ?? '' };
  }
  return { role: '', company: '' };
}

/**
 * Extract job details from the DOM, falling back to AI extraction when both
 * `company` and `role` are empty and an AI config is provided.
 */
export async function extractJobDetailsWithFallback(
  jobId: string,
  config?: AIConfig,
): Promise<ExtractedJob> {
  const base = extractJobDetails(jobId);
  if (base.company || base.role || !config) return base;

  // Both fields empty: try AI extraction from page text.
  try {
    const ai = await aiExtractJobDetails(getPageText(), config);
    return {
      ...base,
      company: ai.company || base.company,
      role: ai.role || base.role,
      location: ai.location ?? base.location,
    };
  } catch {
    return base; // fail silently
  }
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

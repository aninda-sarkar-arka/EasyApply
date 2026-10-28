import { generateJSON } from '../../ai/index';
import type { AIConfig } from '../../ai/types';
import {
  buildJobExtractionPrompt,
  jobExtractionSchema,
  type JobExtractionResult,
} from '../../ai/prompts/jobExtraction';

/**
 * Use the AI layer to extract job details from raw page text.
 * Called only when DOM selectors fail to find company or role.
 */
export async function aiExtractJobDetails(
  pageText: string,
  config: AIConfig,
): Promise<JobExtractionResult> {
  return generateJSON(buildJobExtractionPrompt(pageText), jobExtractionSchema, config);
}

/** Grab visible page text, capped at 4 000 chars to stay within prompt budgets. */
export function getPageText(): string {
  return (document.body.innerText ?? '').slice(0, 4000);
}

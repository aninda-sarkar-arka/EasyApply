import { z } from 'zod';

export const jobExtractionSchema = z.object({
  role: z.string(),
  company: z.string(),
  location: z.string().nullable(),
});

export type JobExtractionResult = z.infer<typeof jobExtractionSchema>;

/** Build a prompt that asks the AI to extract job details from raw page text. */
export function buildJobExtractionPrompt(pageText: string): string {
  return `You are reading the text content of a LinkedIn job posting page. Extract the following fields:
- "role": the job title (e.g. "Senior Software Engineer")
- "company": the hiring company name (e.g. "Acme Corp")
- "location": city and/or remote status, or null if not present

Page text (truncated):
${pageText}

Return a JSON object with exactly these keys: role, company, location.
If a field cannot be determined, use an empty string for role/company and null for location.`;
}

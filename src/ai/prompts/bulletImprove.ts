import { z } from 'zod';

export function buildBulletImprovePrompt(bullet: string): string {
  return `You are an expert resume writer. Improve the following resume bullet point to be more professional, quantified, and impactful. Use strong action verbs, add metrics where possible, and make it concise.

Original bullet point:
"${bullet}"

Return a JSON object with a single key "suggestions" containing an array of exactly 3 improved versions as strings.`;
}

export const bulletImproveSchema = z.object({
  suggestions: z.array(z.string()).length(3),
});

export type BulletImproveResult = z.infer<typeof bulletImproveSchema>;

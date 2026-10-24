import { z } from 'zod';

export function buildInterviewQuestionsPrompt(role: string, jobDescription: string): string {
  return `You are an experienced technical interviewer. Generate interview preparation questions for the following role:

Role: ${role}
Job Description: ${jobDescription}

Return a JSON object with two keys:
- "technical": an array of exactly 5 technical questions specific to the role
- "behavioral": an array of exactly 5 behavioral / HR questions about teamwork, leadership, and problem-solving`;
}

export const interviewQuestionsSchema = z.object({
  technical: z.array(z.string()).length(5),
  behavioral: z.array(z.string()).length(5),
});

export type InterviewQuestionsResult = z.infer<typeof interviewQuestionsSchema>;

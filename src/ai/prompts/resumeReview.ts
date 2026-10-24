export function buildResumeReviewPrompt(resumeText: string, jobDescription: string): string {
  return `You are an expert career coach and resume reviewer. Analyze the following resume against the provided job description. Provide structured feedback covering:

1. **Overall Impression** — Brief summary of the resume quality.
2. **Strengths** — What the resume does well.
3. **Areas for Improvement** — Specific suggestions.
4. **Keyword Optimization** — Missing keywords from the job description.
5. **Formatting & Clarity** — Readability and structure feedback.

Job Description:
${jobDescription}

Resume:
${resumeText}`;
}

export function buildJobMatchPrompt(resumeText: string, jobDescription: string): string {
  return `You are a recruiting expert. Compare the following resume with the job description and provide:

1. **Fit Level** — How well the candidate matches (Strong Fit / Moderate Fit / Weak Fit).
2. **Matching Skills & Experience** — What aligns well.
3. **Missing Skills or Qualifications** — What the candidate lacks.
4. **Recommendations** — Steps the candidate should take to improve their fit.

Job Description:
${jobDescription}

Resume:
${resumeText}`;
}

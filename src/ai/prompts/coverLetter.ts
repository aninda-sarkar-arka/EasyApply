export function buildCoverLetterPrompt(jobDescription: string, userProfile: string): string {
  return `You are a professional cover letter writer. Generate a compelling, tailored cover letter based on the following:

Job Description:
${jobDescription}

Candidate Profile:
${userProfile}

Write a professional cover letter that:
- Opens with an engaging hook
- Highlights relevant experience and skills
- Shows enthusiasm for the role and company
- Ends with a strong call to action
- Is about 300-400 words

Return only the cover letter text, ready to use.`;
}

const { GoogleGenAI } = require('@google/genai');

let ai;
try {
  // Uses process.env.GEMINI_API_KEY automatically if set
  ai = new GoogleGenAI({});
} catch (e) {
  // Will be handled in the call function
}

const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error('GEMINI_API_KEY is not set');
    err.status = 500;
    throw err;
  }
  
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || 'No response from AI.';
};

const parseAiError = (err) => {
  const apiMessage = err.message || 'Unknown AI error';

  if (err.message === 'GEMINI_API_KEY is not set') {
    return { status: 500, message: 'GEMINI_API_KEY is not set.' };
  }

  if (/quota/i.test(apiMessage) || /exhausted/i.test(apiMessage) || /429/.test(apiMessage)) {
    return {
      status: 429,
      message: 'Gemini API quota exceeded or rate limited. Please check your Google AI Studio account.',
    };
  }

  return { status: 500, message: apiMessage };
};

/** Public health check: validates config; does not call the external API (saves quota). */
exports.health = (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    ok: hasKey,
    provider: 'Google GenAI SDK',
    model: 'gemini-3-flash-preview',
    message: hasKey
      ? 'GEMINI_API_KEY is set. AI routes can call the API.'
      : 'Set GEMINI_API_KEY in backend/.env to enable AI features.',
  });
};

exports.resumeReview = async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  try {
    const prompt = `You are an expert career coach and resume reviewer. Analyze the following resume against the provided job description. Provide structured feedback covering:

1. **Overall Impression** — Brief summary of the resume quality.
2. **Strengths** — What the resume does well.
3. **Areas for Improvement** — Specific suggestions.
4. **Keyword Optimization** — Missing keywords from the job description.
5. **Formatting & Clarity** — Readability and structure feedback.

Job Description:
${jobDescription}

Resume:
${resumeText}`;

    const feedback = await callGemini(prompt);
    res.json({ feedback });
  } catch (err) {
    const parsed = parseAiError(err);
    console.error('AI Resume Review Error:', err.response?.data || err.message);
    res.status(parsed.status).json({ msg: 'AI service error', error: parsed.message });
  }
};

exports.jobMatch = async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  try {
    const prompt = `You are a recruiting expert. Compare the following resume with the job description and provide:

1. **Fit Level** — How well the candidate matches (Strong Fit / Moderate Fit / Weak Fit).
2. **Matching Skills & Experience** — What aligns well.
3. **Missing Skills or Qualifications** — What the candidate lacks.
4. **Recommendations** — Steps the candidate should take to improve their fit.

Job Description:
${jobDescription}

Resume:
${resumeText}`;

    const match = await callGemini(prompt);
    res.json({ match });
  } catch (err) {
    const parsed = parseAiError(err);
    console.error('AI Job Match Error:', err.response?.data || err.message);
    res.status(parsed.status).json({ msg: 'AI service error', error: parsed.message });
  }
};

exports.improveBullet = async (req, res) => {
  const { bullet } = req.body;
  try {
    const prompt = `You are an expert resume writer. Improve the following resume bullet point to be more professional, quantified, and impactful. Use strong action verbs, add metrics where possible, and make it concise. Provide 3 improved versions.

Original bullet point:
"${bullet}"

Return ONLY the 3 improved versions, numbered 1-3.`;

    const improved = await callGemini(prompt);
    res.json({ improved });
  } catch (err) {
    const parsed = parseAiError(err);
    console.error('AI Bullet Improve Error:', err.response?.data || err.message);
    res.status(parsed.status).json({ msg: 'AI service error', error: parsed.message });
  }
};

exports.generateCoverLetter = async (req, res) => {
  const { jobDescription, userProfile } = req.body;
  try {
    const prompt = `You are a professional cover letter writer. Generate a compelling, tailored cover letter based on the following:

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

    const coverLetter = await callGemini(prompt);
    res.json({ coverLetter });
  } catch (err) {
    const parsed = parseAiError(err);
    console.error('AI Cover Letter Error:', err.response?.data || err.message);
    res.status(parsed.status).json({ msg: 'AI service error', error: parsed.message });
  }
};

exports.generateInterviewQuestions = async (req, res) => {
  const { jobDescription, role } = req.body;
  try {
    const prompt = `You are an experienced technical interviewer. Generate interview preparation questions for the following role:

Role: ${role}
Job Description: ${jobDescription}

Provide exactly 10 questions in two categories:

**Technical Questions** (5 questions)
— Role-specific technical questions that test core competencies.

**Behavioral / HR Questions** (5 questions)
— Questions about teamwork, leadership, problem-solving, and cultural fit.

Return each question on its own line, with the category headers.`;

    const text = await callGemini(prompt);
    const questions = text.split('\n').filter(line => line.trim().length > 0);
    res.json({ questions });
  } catch (err) {
    const parsed = parseAiError(err);
    console.error('AI Interview Questions Error:', err.response?.data || err.message);
    res.status(parsed.status).json({ msg: 'AI service error', error: parsed.message });
  }
};
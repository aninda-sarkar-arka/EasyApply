import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateText, generateJSON } from '../../ai/index';
import type { AIConfig, AIProvider, AITier } from '../../ai/types';
import { AICallError } from '../../ai/types';
import { buildResumeReviewPrompt } from '../../ai/prompts/resumeReview';
import { buildJobMatchPrompt } from '../../ai/prompts/jobMatch';
import { buildBulletImprovePrompt, bulletImproveSchema } from '../../ai/prompts/bulletImprove';
import { buildCoverLetterPrompt } from '../../ai/prompts/coverLetter';
import { buildInterviewQuestionsPrompt, interviewQuestionsSchema } from '../../ai/prompts/interviewQuestions';
import * as settingsRepo from '../../db/repositories/settings';

type Tab = 'resume-review' | 'job-match' | 'bullet' | 'cover-letter' | 'interview';

const TABS: { id: Tab; label: string }[] = [
  { id: 'resume-review', label: 'Resume Review' },
  { id: 'job-match', label: 'Job Match' },
  { id: 'bullet', label: 'Bullet Improve' },
  { id: 'cover-letter', label: 'Cover Letter' },
  { id: 'interview', label: 'Interview Prep' },
];

async function loadConfig(): Promise<AIConfig | null> {
  const [provider, apiKey, tier] = await Promise.all([
    settingsRepo.get('ai.provider'),
    settingsRepo.get('ai.apiKey'),
    settingsRepo.get('ai.tier'),
  ]);
  if (!provider || !apiKey) return null;
  return {
    provider: provider as AIProvider,
    apiKey,
    tier: (tier ?? 'fast') as AITier,
  };
}

export default function AITools() {
  const [tab, setTab] = useState<Tab>('resume-review');
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  useEffect(() => {
    void loadConfig().then((c) => setHasConfig(c !== null));
  }, []);

  if (hasConfig === null) return <section className="page page-content"><div className="notice">Loading...</div></section>;

  if (!hasConfig) {
    return (
      <section className="page page-content">
        <div className="page-header"><h1>AI Tools</h1></div>
        <div className="panel empty-state">
          <h3>No API key configured</h3>
          <p>Go to <strong>Settings</strong> to add your OpenAI, Anthropic, or Gemini API key to unlock AI features.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>AI Tools</h1>
        <p>Career tools powered by your own API key.</p>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resume-review' && <ResumeReviewTool />}
      {tab === 'job-match' && <JobMatchTool />}
      {tab === 'bullet' && <BulletImproveTool />}
      {tab === 'cover-letter' && <CoverLetterTool />}
      {tab === 'interview' && <InterviewPrepTool />}
    </section>
  );
}

/* ── shared helpers ── */

function ResultBox({ text }: { text: string }) {
  return (
    <div className="ai-result" style={{ marginTop: '1rem' }}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run<T>(fn: (config: AIConfig) => Promise<T>, onSuccess: (result: T) => void) {
    setError('');
    setLoading(true);
    try {
      const config = await loadConfig();
      if (!config) { setError('No API key configured. Go to Settings.'); return; }
      const result = await fn(config);
      onSuccess(result);
    } catch (err) {
      if (err instanceof AICallError) {
        setError(err.aiError.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, run };
}

/* ── individual tool panels ── */

function ResumeReviewTool() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [result, setResult] = useState('');
  const { loading, error, run } = useAI();

  const submit = () => void run(
    (cfg) => generateText(buildResumeReviewPrompt(resume, jd), cfg),
    setResult,
  );

  return (
    <div className="form-stack">
      <div className="form-group">
        <label>Resume text</label>
        <textarea rows={8} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Paste your resume here..." />
      </div>
      <div className="form-group">
        <label>Job description</label>
        <textarea rows={6} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." />
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="nav-cta" disabled={loading || !resume || !jd} onClick={submit}>
        {loading ? 'Reviewing...' : 'Review Resume'}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function JobMatchTool() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [result, setResult] = useState('');
  const { loading, error, run } = useAI();

  const submit = () => void run(
    (cfg) => generateText(buildJobMatchPrompt(resume, jd), cfg),
    setResult,
  );

  return (
    <div className="form-stack">
      <div className="form-group">
        <label>Resume text</label>
        <textarea rows={8} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Paste your resume here..." />
      </div>
      <div className="form-group">
        <label>Job description</label>
        <textarea rows={6} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." />
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="nav-cta" disabled={loading || !resume || !jd} onClick={submit}>
        {loading ? 'Analyzing...' : 'Analyze Match'}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function BulletImproveTool() {
  const [bullet, setBullet] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { loading, error, run } = useAI();

  const submit = () => void run(
    (cfg) => generateJSON(buildBulletImprovePrompt(bullet), bulletImproveSchema, cfg),
    (r) => setSuggestions(r.suggestions),
  );

  return (
    <div className="form-stack">
      <div className="form-group">
        <label>Resume bullet point</label>
        <input
          type="text"
          value={bullet}
          onChange={(e) => setBullet(e.target.value)}
          placeholder='e.g. "Worked on backend systems"'
        />
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="nav-cta" disabled={loading || !bullet.trim()} onClick={submit}>
        {loading ? 'Improving...' : 'Improve Bullet'}
      </button>
      {suggestions.length > 0 && (
        <div className="panel" style={{ marginTop: '1rem' }}>
          <p className="muted" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>3 Improved Versions</p>
          {suggestions.map((s, i) => (
            <div key={i} className="note-card" style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: 0 }}><strong style={{ color: '#6ea8fe' }}>{i + 1}.</strong> {s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoverLetterTool() {
  const [jd, setJd] = useState('');
  const [profile, setProfile] = useState('');
  const [result, setResult] = useState('');
  const { loading, error, run } = useAI();

  const submit = () => void run(
    (cfg) => generateText(buildCoverLetterPrompt(jd, profile), cfg),
    setResult,
  );

  return (
    <div className="form-stack">
      <div className="form-group">
        <label>Job description</label>
        <textarea rows={6} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." />
      </div>
      <div className="form-group">
        <label>Your profile / experience summary</label>
        <textarea rows={6} value={profile} onChange={(e) => setProfile(e.target.value)} placeholder="Brief summary of your background, skills, and relevant experience..." />
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="nav-cta" disabled={loading || !jd || !profile} onClick={submit}>
        {loading ? 'Writing...' : 'Generate Cover Letter'}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function InterviewPrepTool() {
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [questions, setQuestions] = useState<{ technical: string[]; behavioral: string[] } | null>(null);
  const { loading, error, run } = useAI();

  const submit = () => void run(
    (cfg) => generateJSON(buildInterviewQuestionsPrompt(role, jd), interviewQuestionsSchema, cfg),
    setQuestions,
  );

  return (
    <div className="form-stack">
      <div className="form-group">
        <label>Role title</label>
        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder='e.g. "Senior Software Engineer"' />
      </div>
      <div className="form-group">
        <label>Job description</label>
        <textarea rows={6} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." />
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="nav-cta" disabled={loading || !role || !jd} onClick={submit}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {questions && (
        <div style={{ marginTop: '1rem' }}>
          <div className="panel" style={{ marginBottom: '1rem' }}>
            <p className="muted" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Technical Questions</p>
            {questions.technical.map((q, i) => (
              <div key={i} className="note-card" style={{ marginBottom: '0.5rem' }}>
                <p style={{ margin: 0 }}><strong style={{ color: '#6ea8fe' }}>{i + 1}.</strong> {q}</p>
              </div>
            ))}
          </div>
          <div className="panel">
            <p className="muted" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Behavioral Questions</p>
            {questions.behavioral.map((q, i) => (
              <div key={i} className="note-card" style={{ marginBottom: '0.5rem' }}>
                <p style={{ margin: 0 }}><strong style={{ color: '#ffe29f' }}>{i + 1}.</strong> {q}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const TABS = [
  { id: 'review', label: 'Resume Review', icon: '📋' },
  { id: 'match', label: 'Job Match', icon: '🎯' },
  { id: 'bullet', label: 'Bullet Improve', icon: '✏️' },
  { id: 'cover', label: 'Cover Letter', icon: '✉️' },
  { id: 'interview', label: 'Interview Prep', icon: '🎙️' },
];

const AITools = () => {
  const [activeTab, setActiveTab] = useState('review');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiHealth, setAiHealth] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/ai/health');
        if (!cancelled) setAiHealth(data);
      } catch {
        if (!cancelled) setAiHealth({ ok: false, message: 'Could not reach AI health endpoint. Is the backend running?' });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Form states
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [bullet, setBullet] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [role, setRole] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_result.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const callAI = async (endpoint, data) => {
    setLoading(true);
    setResult('');
    setError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/ai/${endpoint}`, data);
      const responseText = res.data.feedback || res.data.match || res.data.improved || res.data.coverLetter || (res.data.questions && res.data.questions.join('\n')) || 'No response.';
      setResult(responseText);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(
          'AI quota exceeded for the current Gemini API key. Please enable billing/increase quota or switch to another API key in backend/.env, then restart backend.'
        );
        return;
      }
      const detail = err.response?.data?.error || err.response?.data?.msg;
      setError(detail || 'AI service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (activeTab) {
      case 'review':
        callAI('resume-review', { resumeText, jobDescription });
        break;
      case 'match':
        callAI('job-match', { resumeText, jobDescription });
        break;
      case 'bullet':
        callAI('improve-bullet', { bullet });
        break;
      case 'cover':
        callAI('cover-letter', { jobDescription, userProfile });
        break;
      case 'interview':
        callAI('interview-questions', { jobDescription, role });
        break;
      default:
        break;
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'review':
        return (
          <>
            <div className="form-group">
              <label>Your Resume Text *</label>
              <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume content here..." rows={6} required />
            </div>
            <div className="form-group">
              <label>Job Description *</label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." rows={5} required />
            </div>
          </>
        );
      case 'match':
        return (
          <>
            <div className="form-group">
              <label>Your Resume Text *</label>
              <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume content here..." rows={6} required />
            </div>
            <div className="form-group">
              <label>Job Description *</label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." rows={5} required />
            </div>
          </>
        );
      case 'bullet':
        return (
          <div className="form-group">
            <label>Resume Bullet Point *</label>
            <textarea value={bullet} onChange={(e) => setBullet(e.target.value)} placeholder="e.g. Worked on the backend team to build APIs" rows={3} required />
          </div>
        );
      case 'cover':
        return (
          <>
            <div className="form-group">
              <label>Job Description *</label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." rows={5} required />
            </div>
            <div className="form-group">
              <label>Your Profile / Background *</label>
              <textarea value={userProfile} onChange={(e) => setUserProfile(e.target.value)} placeholder="Describe your skills, experience, and what you bring..." rows={4} required />
            </div>
          </>
        );
      case 'interview':
        return (
          <>
            <div className="form-group">
              <label>Role Title *</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Software Engineer" required />
            </div>
            <div className="form-group">
              <label>Job Description *</label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." rows={5} required />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>AI Tools</h1>
        <p>Powered by Google Gemini — get AI-powered career assistance.</p>
      </div>

      {aiHealth && (
        <div className={`notice${aiHealth.ok ? ' success' : ''}`} style={{ borderColor: aiHealth.ok ? '#25513a' : undefined }}>
          <strong style={{ color: '#f5f9ff' }}>AI status:</strong>{' '}
          {aiHealth.message || (aiHealth.ok ? 'Ready.' : 'Not configured.')}
          {aiHealth.model && (
            <span className="muted" style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.85rem' }}>
              {aiHealth.provider} · {aiHealth.model}
            </span>
          )}
        </div>
      )}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setResult(''); setError(''); }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="panel-title">
          <h2>{currentTab?.icon} {currentTab?.label}</h2>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          {renderForm()}
          <button type="submit" className="nav-cta" disabled={loading}>
            {loading ? 'Generating...' : `Generate ${currentTab?.label}`}
          </button>
        </form>
      </section>

      {error && <div className="notice error">{error}</div>}

      {loading && (
        <div className="panel">
          <div className="ai-loading">
            <div className="spinner"></div>
            AI is thinking...
          </div>
        </div>
      )}

      {result && (
        <section className="panel">
          <div className="panel-title">
            <h2>Result</h2>
            <div className="row-actions" style={{ gap: '0.4rem' }}>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button className="copy-btn" onClick={handleDownload}>
                Download
              </button>
            </div>
          </div>
          <div className="ai-result">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </section>
      )}
    </section>
  );
};

export default AITools;

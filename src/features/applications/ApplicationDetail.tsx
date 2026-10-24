import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import * as applicationsRepository from '../../db/repositories/applications';
import type { Application, ApplicationStatus } from '../../db/schema';
import { toDatetimeLocalValue, getDeadlineInsight, getInterviewUrgency } from '../../lib/insights';

const STATUSES: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected'];

interface AppFormState {
  company: string;
  role: string;
  jobLink: string;
  salary: string;
  jobDescription: string;
  notes: string;
  status: ApplicationStatus;
  deadline: string;
  interviewDate: string;
}

function formFromApp(app: Application): AppFormState {
  return {
    company: app.company,
    role: app.role,
    jobLink: app.jobLink ?? '',
    salary: app.salary ?? '',
    jobDescription: app.jobDescription ?? '',
    notes: app.notes ?? '',
    status: app.status,
    deadline: app.deadline ? toDatetimeLocalValue(app.deadline) : '',
    interviewDate: app.interviewDate ? toDatetimeLocalValue(app.interviewDate) : '',
  };
}

interface NoteFormState {
  question: string;
  answer: string;
  feedback: string;
}

const EMPTY_NOTE: NoteFormState = { question: '', answer: '', feedback: '' };

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<AppFormState>({
    company: '',
    role: '',
    jobLink: '',
    salary: '',
    jobDescription: '',
    notes: '',
    status: 'applied',
    deadline: '',
    interviewDate: '',
  });
  const [noteForm, setNoteForm] = useState<NoteFormState>(EMPTY_NOTE);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const appId = id ? Number(id) : NaN;

  useEffect(() => {
    if (Number.isNaN(appId)) {
      setError('Invalid application ID.');
      setLoading(false);
      return;
    }
    applicationsRepository
      .getById(appId)
      .then((data) => {
        if (!data) {
          setError('Application not found.');
          return;
        }
        setApp(data);
        setFormData(formFromApp(data));
      })
      .catch(() => setError('Unable to load this application.'))
      .finally(() => setLoading(false));
  }, [appId]);

  const reload = async () => {
    if (Number.isNaN(appId)) return;
    const data = await applicationsRepository.getById(appId);
    if (data) {
      setApp(data);
      setFormData(formFromApp(data));
    }
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!app?.id) return;
    try {
      await applicationsRepository.update(app.id, { status: newStatus });
      await reload();
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app?.id) return;
    try {
      await applicationsRepository.update(app.id, {
        company: formData.company,
        role: formData.role,
        jobLink: formData.jobLink || undefined,
        salary: formData.salary || undefined,
        jobDescription: formData.jobDescription || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        interviewDate: formData.interviewDate
          ? new Date(formData.interviewDate).toISOString()
          : undefined,
      });
      setEditing(false);
      await reload();
    } catch {
      setError('Failed to save changes.');
    }
  };

  const handleDelete = async () => {
    if (!app?.id) return;
    if (!window.confirm('Delete this application permanently?')) return;
    try {
      await applicationsRepository.remove(app.id);
      navigate('/applications');
    } catch {
      setError('Failed to delete.');
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app?.id) return;
    try {
      await applicationsRepository.addInterviewNote(app.id, noteForm);
      setNoteForm(EMPTY_NOTE);
      setShowNoteForm(false);
      await reload();
    } catch {
      setError('Failed to add note.');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!app?.id) return;
    try {
      await applicationsRepository.removeInterviewNote(app.id, noteId);
      await reload();
    } catch {
      setError('Failed to delete note.');
    }
  };

  const set = <K extends keyof AppFormState>(key: K, value: AppFormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const setNote = <K extends keyof NoteFormState>(key: K, value: NoteFormState[K]) =>
    setNoteForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <section className="page page-content">
        <div className="notice">Loading details...</div>
      </section>
    );
  }

  if (error && !app) {
    return (
      <section className="page page-content">
        <div className="notice error">{error}</div>
        <Link className="inline-link" to="/applications">
          ← Back to applications
        </Link>
      </section>
    );
  }

  const currentIdx = STATUSES.indexOf(app?.status ?? 'applied');

  return (
    <section className="page page-content">
      <Link className="inline-link" to="/applications" style={{ fontSize: '0.88rem' }}>
        ← Back to applications
      </Link>

      {error && <div className="notice error">{error}</div>}

      <div className="page-header page-header-row">
        <div>
          <h1>{app?.company ?? 'Application'}</h1>
          <p>
            {app?.role ?? 'Role details'}
            {app?.salary ? ` • ${app.salary}` : ''}
          </p>
        </div>
        <div className="row-actions">
          <button className="nav-cta small ghost" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button className="nav-cta small danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Status pipeline */}
      <div className="pipeline">
        {STATUSES.map((s, i) => (
          <div
            key={s}
            className={`pipeline-step${i === currentIdx ? ' active' : ''}${i < currentIdx ? ' completed' : ''}`}
            onClick={() => handleStatusChange(s)}
          >
            {s}
          </div>
        ))}
      </div>

      {editing ? (
        <form className="panel form-stack" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input value={formData.company} onChange={(e) => set('company', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input value={formData.role} onChange={(e) => set('role', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Job Link</label>
              <input value={formData.jobLink} onChange={(e) => set('jobLink', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Salary</label>
              <input value={formData.salary} onChange={(e) => set('salary', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Application deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => set('deadline', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Interview date &amp; time</label>
              <input
                type="datetime-local"
                value={formData.interviewDate}
                onChange={(e) => set('interviewDate', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => set('status', e.target.value as ApplicationStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => set('jobDescription', e.target.value)}
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
            />
          </div>
          <button type="submit" className="nav-cta">
            Save Changes
          </button>
        </form>
      ) : (
        <section className="panel detail-grid">
          <div className="detail-item">
            <p>Company</p>
            <h3>{app?.company ?? '-'}</h3>
          </div>
          <div className="detail-item">
            <p>Role</p>
            <h3>{app?.role ?? '-'}</h3>
          </div>
          <div className="detail-item">
            <p>Status</p>
            <h3>
              <span className={`badge ${app?.status}`}>{app?.status}</span>
            </h3>
          </div>
          <div className="detail-item">
            <p>Applied Date</p>
            <h3>
              {app?.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}
            </h3>
          </div>
          <div className="detail-item">
            <p>Application deadline</p>
            <h3>
              {app?.deadline ? new Date(app.deadline).toLocaleString() : '—'}
              {app?.deadline && getDeadlineInsight(app.deadline) && (
                <span className={`inline-pill inline-pill--${getDeadlineInsight(app.deadline)!.tone}`}>
                  {getDeadlineInsight(app.deadline)!.label}
                </span>
              )}
            </h3>
          </div>
          <div className="detail-item">
            <p>Interview</p>
            <h3>
              {app?.interviewDate ? new Date(app.interviewDate).toLocaleString() : '—'}
              {app?.interviewDate && getInterviewUrgency(app.interviewDate) && (
                <span
                  className={`inline-pill ${
                    getInterviewUrgency(app.interviewDate)!.level === 'urgent'
                      ? 'inline-pill--urgent'
                      : getInterviewUrgency(app.interviewDate)!.level === 'past'
                        ? 'inline-pill--muted'
                        : 'inline-pill--soon'
                  }`}
                >
                  {getInterviewUrgency(app.interviewDate)!.level === 'urgent'
                    ? 'Urgent'
                    : getInterviewUrgency(app.interviewDate)!.label}
                </span>
              )}
            </h3>
          </div>
          <div className="detail-item">
            <p>Salary</p>
            <h3>{app?.salary ?? '-'}</h3>
          </div>
          <div className="detail-item">
            <p>Job Link</p>
            <h3>
              {app?.jobLink ? (
                <a href={app.jobLink} target="_blank" rel="noreferrer" className="inline-link">
                  {app.jobLink.substring(0, 40)}...
                </a>
              ) : (
                '-'
              )}
            </h3>
          </div>
          {app?.jobDescription && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <p>Job Description</p>
              <div className="ai-result" style={{ maxHeight: '200px' }}>
                <ReactMarkdown>{app.jobDescription}</ReactMarkdown>
              </div>
            </div>
          )}
          {app?.notes && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <p>Notes</p>
              <h3 style={{ fontWeight: 400, lineHeight: 1.5 }}>{app.notes}</h3>
            </div>
          )}
        </section>
      )}

      {/* AI Feedback */}
      {(app?.aiFeedback?.resumeReview ||
        app?.aiFeedback?.jobMatch ||
        app?.aiFeedback?.coverLetter) && (
        <section className="panel">
          <div className="panel-title">
            <h2>AI Feedback</h2>
          </div>
          {app.aiFeedback?.resumeReview && (
            <div style={{ marginBottom: '1rem' }}>
              <p className="muted" style={{ marginBottom: '0.4rem', fontWeight: 600 }}>
                Resume Review
              </p>
              <div className="ai-result">
                <ReactMarkdown>{app.aiFeedback.resumeReview}</ReactMarkdown>
              </div>
            </div>
          )}
          {app.aiFeedback?.jobMatch && (
            <div style={{ marginBottom: '1rem' }}>
              <p className="muted" style={{ marginBottom: '0.4rem', fontWeight: 600 }}>
                Job Match Analysis
              </p>
              <div className="ai-result">
                <ReactMarkdown>{app.aiFeedback.jobMatch}</ReactMarkdown>
              </div>
            </div>
          )}
          {app.aiFeedback?.coverLetter && (
            <div>
              <p className="muted" style={{ marginBottom: '0.4rem', fontWeight: 600 }}>
                Cover Letter
              </p>
              <div className="ai-result">
                <ReactMarkdown>{app.aiFeedback.coverLetter}</ReactMarkdown>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Interview notes */}
      <section className="panel">
        <div className="panel-title">
          <h2>Interview Notes</h2>
          <button
            className="nav-cta small"
            onClick={() => setShowNoteForm(!showNoteForm)}
          >
            {showNoteForm ? 'Cancel' : '+ Add Note'}
          </button>
        </div>

        {showNoteForm && (
          <form className="form-stack" onSubmit={addNote} style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Question Asked</label>
              <input
                value={noteForm.question}
                onChange={(e) => setNote('question', e.target.value)}
                placeholder="e.g. Tell me about a challenging project..."
                required
              />
            </div>
            <div className="form-group">
              <label>Your Answer / Response</label>
              <textarea
                value={noteForm.answer}
                onChange={(e) => setNote('answer', e.target.value)}
                placeholder="How you answered..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Feedback / Notes</label>
              <textarea
                value={noteForm.feedback}
                onChange={(e) => setNote('feedback', e.target.value)}
                placeholder="Interviewer feedback, your observations..."
                rows={2}
              />
            </div>
            <button type="submit" className="nav-cta small">
              Save Note
            </button>
          </form>
        )}

        {!app?.interviewNotes || app.interviewNotes.length === 0 ? (
          <p className="muted">
            No interview notes yet. Add notes to build your knowledge base.
          </p>
        ) : (
          app.interviewNotes.map((note) => (
            <div className="note-card" key={note.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h4>Q: {note.question}</h4>
                <button className="remove-btn" onClick={() => deleteNote(note.id)}>
                  ×
                </button>
              </div>
              {note.answer && (
                <p>
                  <strong style={{ color: '#6ea8fe' }}>Answer:</strong> {note.answer}
                </p>
              )}
              {note.feedback && (
                <p>
                  <strong style={{ color: '#ffe29f' }}>Feedback:</strong> {note.feedback}
                </p>
              )}
              <p className="note-meta">{new Date(note.date).toLocaleString()}</p>
            </div>
          ))
        )}
      </section>

      {/* Activity timeline */}
      <section className="panel">
        <div className="panel-title">
          <h2>Activity timeline</h2>
        </div>
        {(() => {
          const sortedLog = [...(app?.activityLog ?? [])].sort(
            (a, b) => new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime(),
          );
          if (sortedLog.length === 0) {
            return (
              <p className="muted">
                No activity yet. Status changes, deadlines, interview scheduling, and notes are
                logged here automatically.
              </p>
            );
          }
          return (
            <ul className="activity-timeline">
              {sortedLog.map((log, i) => (
                <li key={`${log.timestamp}-${i}`} className="activity-timeline-item">
                  <span className="activity-dot" aria-hidden />
                  <div>
                    <p className="activity-text">{log.action}</p>
                    <time className="activity-time" dateTime={log.timestamp}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>
    </section>
  );
}

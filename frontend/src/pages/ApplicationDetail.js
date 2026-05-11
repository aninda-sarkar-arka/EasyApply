import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { toDatetimeLocalValue, getDeadlineInsight, getInterviewUrgency } from '../utils/applicationInsights';

const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected'];

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Interview note form
  const [noteForm, setNoteForm] = useState({ question: '', answer: '', feedback: '' });
  const [showNoteForm, setShowNoteForm] = useState(false);

  const fetchApp = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/${id}`);
      setApp(res.data);
      setFormData({
        company: res.data.company || '',
        role: res.data.role || '',
        jobLink: res.data.jobLink || '',
        salary: res.data.salary || '',
        jobDescription: res.data.jobDescription || '',
        notes: res.data.notes || '',
        status: res.data.status || 'applied',
        deadline: res.data.deadline ? toDatetimeLocalValue(res.data.deadline) : '',
        interviewDate: res.data.interviewDate ? toDatetimeLocalValue(res.data.interviewDate) : '',
      });
    } catch {
      setError('Unable to load this application.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchApp(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/${id}`, { status: newStatus });
      fetchApp();
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/applications/${id}`, {
        company: formData.company,
        role: formData.role,
        jobLink: formData.jobLink,
        salary: formData.salary,
        jobDescription: formData.jobDescription,
        notes: formData.notes,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '',
        interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : '',
      });
      setEditing(false);
      fetchApp();
    } catch {
      setError('Failed to save changes.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this application permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/applications/${id}`);
      navigate('/applications');
    } catch {
      setError('Failed to delete.');
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/applications/${id}/interview-notes`, noteForm);
      setNoteForm({ question: '', answer: '', feedback: '' });
      setShowNoteForm(false);
      fetchApp();
    } catch {
      setError('Failed to add note.');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`http://localhost:5000/api/applications/${id}/interview-notes/${noteId}`);
      fetchApp();
    } catch {
      setError('Failed to delete note.');
    }
  };

  if (loading) return <section className="page page-content"><div className="notice">Loading details...</div></section>;
  if (error && !app) return (
    <section className="page page-content">
      <div className="notice error">{error}</div>
      <Link className="inline-link" to="/applications">← Back to applications</Link>
    </section>
  );

  const currentIdx = STATUSES.indexOf(app?.status);

  return (
    <section className="page page-content">
      <Link className="inline-link" to="/applications" style={{ fontSize: '0.88rem' }}>← Back to applications</Link>

      {error && <div className="notice error">{error}</div>}

      <div className="page-header page-header-row">
        <div>
          <h1>{app?.company || 'Application'}</h1>
          <p>{app?.role || 'Role details'} {app?.salary ? `• ${app.salary}` : ''}</p>
        </div>
        <div className="row-actions">
          <button className="nav-cta small ghost" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button className="nav-cta small danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Status Pipeline */}
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
              <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Job Link</label>
              <input value={formData.jobLink} onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Salary</label>
              <input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Application deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Interview date &amp; time</label>
              <input
                type="datetime-local"
                value={formData.interviewDate || ''}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea value={formData.jobDescription} onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })} rows={4} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
          </div>
          <button type="submit" className="nav-cta">Save Changes</button>
        </form>
      ) : (
        <section className="panel detail-grid">
          <div className="detail-item"><p>Company</p><h3>{app?.company || '-'}</h3></div>
          <div className="detail-item"><p>Role</p><h3>{app?.role || '-'}</h3></div>
          <div className="detail-item"><p>Status</p><h3><span className={`badge ${app?.status}`}>{app?.status}</span></h3></div>
          <div className="detail-item"><p>Applied Date</p><h3>{app?.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}</h3></div>
          <div className="detail-item">
            <p>Application deadline</p>
            <h3>
              {app?.deadline
                ? new Date(app.deadline).toLocaleString()
                : '—'}
              {app?.deadline && getDeadlineInsight(app.deadline) && (
                <span className={`inline-pill inline-pill--${getDeadlineInsight(app.deadline).tone}`}>
                  {getDeadlineInsight(app.deadline).label}
                </span>
              )}
            </h3>
          </div>
          <div className="detail-item">
            <p>Interview</p>
            <h3>
              {app?.interviewDate
                ? new Date(app.interviewDate).toLocaleString()
                : '—'}
              {app?.interviewDate && getInterviewUrgency(app.interviewDate) && (
                <span
                  className={`inline-pill ${
                    getInterviewUrgency(app.interviewDate).level === 'urgent'
                      ? 'inline-pill--urgent'
                      : getInterviewUrgency(app.interviewDate).level === 'past'
                        ? 'inline-pill--muted'
                        : 'inline-pill--soon'
                  }`}
                >
                  {getInterviewUrgency(app.interviewDate).level === 'urgent'
                    ? 'Urgent'
                    : getInterviewUrgency(app.interviewDate).label}
                </span>
              )}
            </h3>
          </div>
          <div className="detail-item"><p>Salary</p><h3>{app?.salary || '-'}</h3></div>
          <div className="detail-item">
            <p>Job Link</p>
            <h3>{app?.jobLink ? <a href={app.jobLink} target="_blank" rel="noreferrer" className="inline-link">{app.jobLink.substring(0, 40)}...</a> : '-'}</h3>
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

      {/* AI Feedback Section */}
      {(app?.aiFeedback?.resumeReview || app?.aiFeedback?.jobMatch || app?.aiFeedback?.coverLetter) && (
        <section className="panel">
          <div className="panel-title"><h2>AI Feedback</h2></div>
          {app.aiFeedback.resumeReview && (
            <div style={{ marginBottom: '1rem' }}>
              <p className="muted" style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Resume Review</p>
              <div className="ai-result">
                <ReactMarkdown>{app.aiFeedback.resumeReview}</ReactMarkdown>
              </div>
            </div>
          )}
          {app.aiFeedback.jobMatch && (
            <div style={{ marginBottom: '1rem' }}>
              <p className="muted" style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Job Match Analysis</p>
              <div className="ai-result">
                <ReactMarkdown>{app.aiFeedback.jobMatch}</ReactMarkdown>
              </div>
            </div>
          )}
          {app.aiFeedback.coverLetter && (
            <div>
              <p className="muted" style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Cover Letter</p>
              <div className="ai-result">
                <ReactMarkdown>{app.aiFeedback.coverLetter}</ReactMarkdown>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Interview Notes */}
      <section className="panel">
        <div className="panel-title">
          <h2>Interview Notes</h2>
          <button className="nav-cta small" onClick={() => setShowNoteForm(!showNoteForm)}>
            {showNoteForm ? 'Cancel' : '+ Add Note'}
          </button>
        </div>

        {showNoteForm && (
          <form className="form-stack" onSubmit={addNote} style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Question Asked</label>
              <input
                value={noteForm.question}
                onChange={(e) => setNoteForm({ ...noteForm, question: e.target.value })}
                placeholder="e.g. Tell me about a challenging project..."
                required
              />
            </div>
            <div className="form-group">
              <label>Your Answer / Response</label>
              <textarea
                value={noteForm.answer}
                onChange={(e) => setNoteForm({ ...noteForm, answer: e.target.value })}
                placeholder="How you answered..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Feedback / Notes</label>
              <textarea
                value={noteForm.feedback}
                onChange={(e) => setNoteForm({ ...noteForm, feedback: e.target.value })}
                placeholder="Interviewer feedback, your observations..."
                rows={2}
              />
            </div>
            <button type="submit" className="nav-cta small">Save Note</button>
          </form>
        )}

        {(!app?.interviewNotes || app.interviewNotes.length === 0) ? (
          <p className="muted">No interview notes yet. Add notes to build your knowledge base.</p>
        ) : (
          app.interviewNotes.map((note) => (
            <div className="note-card" key={note._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h4>Q: {note.question}</h4>
                <button className="remove-btn" onClick={() => deleteNote(note._id)}>×</button>
              </div>
              {note.answer && <p><strong style={{ color: '#6ea8fe' }}>Answer:</strong> {note.answer}</p>}
              {note.feedback && <p><strong style={{ color: '#ffe29f' }}>Feedback:</strong> {note.feedback}</p>}
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
          const sortedLog = [...(app?.activityLog || [])].sort(
            (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
          );
          if (sortedLog.length === 0) {
            return (
              <p className="muted">
                No activity yet. Status changes, deadlines, interview scheduling, and notes are logged here automatically.
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
};

export default ApplicationDetail;
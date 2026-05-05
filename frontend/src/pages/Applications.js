import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toDatetimeLocalValue, getDeadlineInsight, getInterviewUrgency } from '../utils/applicationInsights';

const STATUS_OPTIONS = ['all', 'saved', 'applied', 'interview', 'offer', 'rejected'];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: '', role: '', jobLink: '', salary: '', jobDescription: '', notes: '', status: 'applied',
    deadline: '', interviewDate: '',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/applications');
      setApplications(res.data);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const resetForm = () => {
    setFormData({
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
    setEditingId(null);
    setShowForm(false);
  };

  const payloadFromForm = () => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = payloadFromForm();
      if (editingId) {
        await axios.put(`http://localhost:5000/api/applications/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/applications', payload);
      }
      resetForm();
      fetchApplications();
    } catch {
      setError('Failed to save application.');
    }
  };

  const handleEdit = (app) => {
    setFormData({
      company: app.company || '',
      role: app.role || '',
      jobLink: app.jobLink || '',
      salary: app.salary || '',
      jobDescription: app.jobDescription || '',
      notes: app.notes || '',
      status: app.status || 'applied',
      deadline: app.deadline ? toDatetimeLocalValue(app.deadline) : '',
      interviewDate: app.interviewDate ? toDatetimeLocalValue(app.interviewDate) : '',
    });
    setEditingId(app._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/applications/${id}`);
      fetchApplications();
    } catch {
      setError('Failed to delete application.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/${id}`, { status: newStatus });
      fetchApplications();
    } catch {
      setError('Failed to update status.');
    }
  };

  const matchesSearch = (a) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.company || '').toLowerCase().includes(q) ||
      (a.role || '').toLowerCase().includes(q) ||
      (a.status || '').toLowerCase().includes(q)
    );
  };

  let filtered = applications.filter(matchesSearch);
  if (filter === 'all') {
    filtered = filtered.filter((a) => a.status !== 'saved');
  } else {
    filtered = filtered.filter((a) => a.status === filter);
  }

  const prettyStatus = (s = '') => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

  const countForTab = (tab) => {
    const base = applications.filter(matchesSearch);
    if (tab === 'all') return base.filter((a) => a.status !== 'saved').length;
    return base.filter((a) => a.status === tab).length;
  };

  return (
    <section className="page page-content">
      <div className="page-header page-header-row">
        <div>
          <h1>Applications</h1>
          <p>Keep every opportunity organized in one place.</p>
        </div>
        <button className="nav-cta" onClick={() => { resetForm(); setShowForm(true); }}>
          + New Application
        </button>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div className="search-bar-wrap">
        <input
          type="search"
          className="search-input"
          placeholder="Search by company, role, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search applications"
        />
      </div>

      <div className="tabs">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {prettyStatus(s)} ({countForTab(s)})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="modal">
            <h2>{editingId ? 'Edit Application' : 'New Application'}</h2>
            <form className="form-stack" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Link</label>
                  <input
                    type="url"
                    value={formData.jobLink}
                    onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. $120k - $150k"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Application deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Interview date &amp; time</label>
                  <input
                    type="datetime-local"
                    value={formData.interviewDate}
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
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  placeholder="Paste the job description here..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Personal notes about this application..."
                  rows={3}
                />
              </div>
              <div className="row-actions">
                <button type="button" className="nav-cta ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="nav-cta">{editingId ? 'Save Changes' : 'Add Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <div className="notice">Loading applications...</div>}

      {!loading && filtered.length === 0 && (
        <div className="panel empty-state">
          <h3>No applications found</h3>
          <p>
            {searchQuery.trim()
              ? 'No matches for your search. Try different keywords or clear the search box.'
              : filter === 'all'
                ? 'Click "+ New Application" to start tracking.'
                : `No ${filter} applications yet.`}
          </p>
        </div>
      )}

      <div className="card-list">
        {filtered.map((app) => (
          <article className="panel list-card" key={app._id}>
            <div className="list-card-header">
              <h3>{app.company}</h3>
              <select
                className="badge"
                value={app.status || 'applied'}
                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                style={{
                  cursor: 'pointer',
                  background: 'transparent',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <p className="muted">{app.role} {app.salary ? `• ${app.salary}` : ''}</p>
            <div className="list-card-meta">
              {(() => {
                const d = getDeadlineInsight(app.deadline);
                if (!d) return null;
                return (
                  <span className={`meta-pill meta-pill--${d.tone}`}>{d.label}</span>
                );
              })()}
              {app.interviewDate && (() => {
                const u = getInterviewUrgency(app.interviewDate);
                if (!u || u.level === 'past') return null;
                return (
                  <span className={`meta-pill meta-pill--${u.level === 'urgent' ? 'urgent' : 'interview'}`}>
                    Interview {u.level === 'urgent' ? 'soon' : u.label.toLowerCase()}
                  </span>
                );
              })()}
            </div>
            <div className="list-card-footer">
              <span className="muted" style={{ fontSize: '0.82rem' }}>
                {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'No date'}
              </span>
              <div className="row-actions" style={{ gap: '0.4rem' }}>
                {app.jobLink && (
                  <a href={app.jobLink} target="_blank" rel="noreferrer" className="copy-btn">Job Link ↗</a>
                )}
                <Link className="inline-link" to={`/applications/${app._id}`}>Details</Link>
                <button className="copy-btn" onClick={() => handleEdit(app)}>Edit</button>
                <button className="remove-btn" onClick={() => handleDelete(app._id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Applications;
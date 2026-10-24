import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as applicationsRepository from '../../db/repositories/applications';
import type { Application, ApplicationStatus } from '../../db/schema';
import { toDatetimeLocalValue, getDeadlineInsight, getInterviewUrgency } from '../../lib/insights';

const STATUS_OPTIONS = ['all', 'saved', 'applied', 'interview', 'offer', 'rejected'] as const;
type FilterOption = (typeof STATUS_OPTIONS)[number];

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

const EMPTY_FORM: AppFormState = {
  company: '',
  role: '',
  jobLink: '',
  salary: '',
  jobDescription: '',
  notes: '',
  status: 'applied',
  deadline: '',
  interviewDate: '',
};

function prettyStatus(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AppFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const apps = await applicationsRepository.getAll();
      setApplications(apps);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date().toISOString();
      if (editingId !== null) {
        await applicationsRepository.update(editingId, {
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
      } else {
        await applicationsRepository.create({
          company: formData.company,
          role: formData.role,
          jobLink: formData.jobLink || undefined,
          salary: formData.salary || undefined,
          jobDescription: formData.jobDescription || undefined,
          notes: formData.notes || undefined,
          status: formData.status,
          appliedDate: now,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
          interviewDate: formData.interviewDate
            ? new Date(formData.interviewDate).toISOString()
            : undefined,
          activityLog: [{ action: 'Created', timestamp: now }],
          interviewNotes: [],
        });
      }
      resetForm();
      await fetchApplications();
    } catch {
      setError('Failed to save application.');
    }
  };

  const handleEdit = (app: Application) => {
    setFormData({
      company: app.company,
      role: app.role,
      jobLink: app.jobLink ?? '',
      salary: app.salary ?? '',
      jobDescription: app.jobDescription ?? '',
      notes: app.notes ?? '',
      status: app.status,
      deadline: app.deadline ? toDatetimeLocalValue(app.deadline) : '',
      interviewDate: app.interviewDate ? toDatetimeLocalValue(app.interviewDate) : '',
    });
    setEditingId(app.id ?? null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await applicationsRepository.remove(id);
      await fetchApplications();
    } catch {
      setError('Failed to delete application.');
    }
  };

  const handleStatusChange = async (id: number, newStatus: ApplicationStatus) => {
    try {
      await applicationsRepository.update(id, { status: newStatus });
      await fetchApplications();
    } catch {
      setError('Failed to update status.');
    }
  };

  const matchesSearch = (a: Application) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  };

  let filtered = applications.filter(matchesSearch);
  if (filter === 'all') {
    filtered = filtered.filter((a) => a.status !== 'saved');
  } else {
    filtered = filtered.filter((a) => a.status === filter);
  }

  const countForTab = (tab: FilterOption) => {
    const base = applications.filter(matchesSearch);
    if (tab === 'all') return base.filter((a) => a.status !== 'saved').length;
    return base.filter((a) => a.status === tab).length;
  };

  const set = <K extends keyof AppFormState>(key: K, value: AppFormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="page page-content">
      <div className="page-header page-header-row">
        <div>
          <h1>Applications</h1>
          <p>Keep every opportunity organized in one place.</p>
        </div>
        <button
          className="nav-cta"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
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
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="modal">
            <h2>{editingId !== null ? 'Edit Application' : 'New Application'}</h2>
            <form className="form-stack" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => set('company', e.target.value)}
                    placeholder="e.g. Google"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => set('role', e.target.value)}
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
                    onChange={(e) => set('jobLink', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => set('salary', e.target.value)}
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
                  onChange={(e) => set('jobDescription', e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Personal notes about this application..."
                  rows={3}
                />
              </div>
              <div className="row-actions">
                <button type="button" className="nav-cta ghost" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="nav-cta">
                  {editingId !== null ? 'Save Changes' : 'Add Application'}
                </button>
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
          <article className="panel list-card" key={app.id}>
            <div className="list-card-header">
              <h3>{app.company}</h3>
              <select
                className={`badge ${app.status}`}
                value={app.status}
                onChange={(e) =>
                  app.id !== undefined &&
                  handleStatusChange(app.id, e.target.value as ApplicationStatus)
                }
                style={{ cursor: 'pointer', background: 'transparent', appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <p className="muted">
              {app.role}
              {app.salary ? ` • ${app.salary}` : ''}
            </p>
            <div className="list-card-meta">
              {(() => {
                const d = getDeadlineInsight(app.deadline);
                if (!d) return null;
                return <span className={`meta-pill meta-pill--${d.tone}`}>{d.label}</span>;
              })()}
              {app.interviewDate &&
                (() => {
                  const u = getInterviewUrgency(app.interviewDate);
                  if (!u || u.level === 'past') return null;
                  return (
                    <span
                      className={`meta-pill meta-pill--${u.level === 'urgent' ? 'urgent' : 'interview'}`}
                    >
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
                  <a href={app.jobLink} target="_blank" rel="noreferrer" className="copy-btn">
                    Job Link ↗
                  </a>
                )}
                <Link className="inline-link" to={`/applications/${app.id}`}>
                  Details
                </Link>
                <button className="copy-btn" onClick={() => handleEdit(app)}>
                  Edit
                </button>
                <button
                  className="remove-btn"
                  onClick={() => app.id !== undefined && handleDelete(app.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

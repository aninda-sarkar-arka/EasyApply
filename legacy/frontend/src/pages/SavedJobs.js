import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SavedJobs = () => {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ company: '', role: '', jobLink: '', salary: '', jobDescription: '', notes: '' });

  const fetchSaved = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/applications');
      setSaved(res.data.filter((a) => a.status === 'saved'));
    } catch {
      setError('Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/applications', { ...formData, status: 'saved' });
      setFormData({ company: '', role: '', jobLink: '', salary: '', jobDescription: '', notes: '' });
      setShowForm(false);
      fetchSaved();
    } catch {
      setError('Failed to save job.');
    }
  };

  const convertToApplication = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/${id}`, { status: 'applied' });
      fetchSaved();
    } catch {
      setError('Failed to convert.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this saved job?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/applications/${id}`);
      fetchSaved();
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <section className="page page-content">
      <div className="page-header page-header-row">
        <div>
          <h1>Saved Jobs</h1>
          <p>Jobs you're interested in, saved for later.</p>
        </div>
        <button className="nav-cta" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Save a Job'}
        </button>
      </div>

      {error && <div className="notice error">{error}</div>}

      {showForm && (
        <form className="panel form-stack" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Microsoft" required />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Frontend Developer" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Job Link</label>
              <input value={formData.jobLink} onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Salary</label>
              <input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. $100k" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Why this job interests you..." rows={2} />
          </div>
          <button type="submit" className="nav-cta">Save Job</button>
        </form>
      )}

      {loading && <div className="notice">Loading saved jobs...</div>}

      {!loading && saved.length === 0 && (
        <div className="panel empty-state">
          <h3>No saved jobs yet</h3>
          <p>Save interesting opportunities to review later.</p>
        </div>
      )}

      <div className="card-list">
        {saved.map((job) => (
          <article className="panel list-card" key={job._id}>
            <div className="list-card-header">
              <h3>{job.company}</h3>
              <span className="badge saved">Saved</span>
            </div>
            <p className="muted">{job.role} {job.salary ? `• ${job.salary}` : ''}</p>
            {job.notes && <p className="muted" style={{ fontSize: '0.82rem' }}>{job.notes}</p>}
            <div className="list-card-footer">
              <span className="muted" style={{ fontSize: '0.82rem' }}>
                Saved {new Date(job.appliedDate).toLocaleDateString()}
              </span>
              <div className="row-actions" style={{ gap: '0.4rem' }}>
                {job.jobLink && <a href={job.jobLink} target="_blank" rel="noreferrer" className="copy-btn">View Job ↗</a>}
                <Link className="inline-link" to={`/applications/${job._id}`}>Details</Link>
                <button className="nav-cta small" onClick={() => convertToApplication(job._id)}>Apply Now</button>
                <button className="remove-btn" onClick={() => handleDelete(job._id)}>Remove</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SavedJobs;

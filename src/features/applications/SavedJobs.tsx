import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as applicationsRepository from '../../db/repositories/applications';
import type { Application, ApplicationStatus } from '../../db/schema';

export default function SavedJobs() {
  const [saved, setSaved] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const all = await applicationsRepository.getAll();
      setSaved(all.filter((a) => a.status === 'saved'));
    } catch {
      setError('Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const moveToApplied = async (id: number) => {
    try {
      await applicationsRepository.update(id, { status: 'applied' as ApplicationStatus });
      await load();
    } catch {
      setError('Failed to update status.');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Remove this saved job?')) return;
    try {
      await applicationsRepository.remove(id);
      await load();
    } catch {
      setError('Failed to remove job.');
    }
  };

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Saved Jobs</h1>
        <p>Jobs you want to apply to later.</p>
      </div>

      {error && <div className="notice error">{error}</div>}
      {loading && <div className="notice">Loading...</div>}

      {!loading && saved.length === 0 && (
        <div className="panel empty-state">
          <h3>No saved jobs</h3>
          <p>
            Jobs saved from LinkedIn Easy Apply will appear here. You can also add them manually
            from the <Link to="/applications" className="inline-link">Applications</Link> page.
          </p>
        </div>
      )}

      <div className="card-list">
        {saved.map((app) => (
          <article className="panel list-card" key={app.id}>
            <div className="list-card-header">
              <h3>{app.company}</h3>
              <span className="badge saved">Saved</span>
            </div>
            <p className="muted">
              {app.role}
              {app.salary ? ` • ${app.salary}` : ''}
            </p>
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
                {app.id !== undefined && (
                  <button className="copy-btn" onClick={() => moveToApplied(app.id!)}>
                    Mark Applied
                  </button>
                )}
                {app.id !== undefined && (
                  <button className="remove-btn" onClick={() => remove(app.id!)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

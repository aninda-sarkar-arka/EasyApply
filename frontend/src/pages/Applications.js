import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchApplications();
  }, []);

  const prettyStatus = (status = '') => `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Applications</h1>
        <p>Keep every opportunity organized in one place.</p>
      </div>

      {error && <div className="notice error">{error}</div>}
      {loading && <div className="notice">Loading applications...</div>}

      {!loading && applications.length === 0 && (
        <div className="panel empty-state">
          <h3>No applications yet</h3>
          <p>When you add applications from the backend/API, they will appear here.</p>
        </div>
      )}

      <div className="card-list">
        {applications.map((app) => (
          <article className="panel list-card" key={app._id}>
            <div className="list-card-header">
              <h3>{app.company}</h3>
              <span className={`badge ${app.status || 'applied'}`}>{prettyStatus(app.status || 'applied')}</span>
            </div>
            <p className="muted">{app.role}</p>
            <div className="list-card-footer">
              <span>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'No date set'}</span>
              <Link className="inline-link" to={`/applications/${app._id}`}>
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Applications;
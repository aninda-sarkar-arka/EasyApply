import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const ApplicationDetail = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/applications/${id}`);
        setApplication(res.data);
      } catch {
        try {
          const allRes = await axios.get('http://localhost:5000/api/applications');
          const match = allRes.data.find((app) => app._id === id);
          if (match) {
            setApplication(match);
          } else {
            setError('Application not found.');
          }
        } catch {
          setError('Unable to load this application.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  if (loading) {
    return <section className="page page-content"><div className="notice">Loading details...</div></section>;
  }

  if (error) {
    return (
      <section className="page page-content">
        <div className="notice error">{error}</div>
        <Link className="inline-link" to="/applications">Back to applications</Link>
      </section>
    );
  }

  const info = [
    ['Company', application?.company || '-'],
    ['Role', application?.role || '-'],
    ['Status', application?.status || '-'],
    ['Applied Date', application?.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : '-'],
    ['Location', application?.location || '-'],
    ['Notes', application?.notes || '-'],
  ];

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>{application?.company || 'Application'}</h1>
        <p>{application?.role || 'Role details'}</p>
      </div>
      <section className="panel detail-grid">
        {info.map(([label, value]) => (
          <div key={label} className="detail-item">
            <p>{label}</p>
            <h3>{value}</h3>
          </div>
        ))}
      </section>
      <Link className="inline-link" to="/applications">Back to applications</Link>
    </section>
  );
};

export default ApplicationDetail;
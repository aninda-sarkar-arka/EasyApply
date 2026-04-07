import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications');
        const applications = res.data;
        const total = applications.length;
        const interviews = applications.filter((a) => a.status === 'interview').length;
        const offers = applications.filter((a) => a.status === 'offer').length;
        const rejections = applications.filter((a) => a.status === 'rejected').length;
        setStats({ total, interviews, offers, rejections });
      } catch {
        setError('Unable to load dashboard stats right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const data = [
    { name: 'Total', value: stats.total },
    { name: 'Interviews', value: stats.interviews },
    { name: 'Offers', value: stats.offers },
    { name: 'Rejections', value: stats.rejections },
  ];

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Overview</h1>
        <p>Track your progress from application to offer.</p>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div className="stats-grid">
        <article className="stat-card">
          <p>Total Applications</p>
          <h3>{loading ? '...' : stats.total || 0}</h3>
        </article>
        <article className="stat-card">
          <p>Interviews</p>
          <h3>{loading ? '...' : stats.interviews || 0}</h3>
        </article>
        <article className="stat-card">
          <p>Offers</p>
          <h3>{loading ? '...' : stats.offers || 0}</h3>
        </article>
        <article className="stat-card">
          <p>Rejections</p>
          <h3>{loading ? '...' : stats.rejections || 0}</h3>
        </article>
      </div>

      <section className="panel">
        <div className="panel-title">
          <h2>Status Breakdown</h2>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
              <XAxis dataKey="name" stroke="#8ca2bd" />
              <YAxis stroke="#8ca2bd" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6ea8fe" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
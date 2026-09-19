import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getUpcomingInterviews, getInterviewUrgency, getDeadlineAlerts } from '../utils/applicationInsights';

const COLORS = ['#6ea8fe', '#ffe29f', '#9ff5c4', '#ffb2b2', '#c7b8ff'];

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications');
        const apps = res.data;
        setApplications(apps);
        const total = apps.length;
        const saved = apps.filter((a) => a.status === 'saved').length;
        const applied = apps.filter((a) => a.status === 'applied').length;
        const interviews = apps.filter((a) => a.status === 'interview').length;
        const offers = apps.filter((a) => a.status === 'offer').length;
        const rejections = apps.filter((a) => a.status === 'rejected').length;
        const active = applied + interviews;
        const offerRate = total > 0 ? ((offers / total) * 100).toFixed(1) : 0;
        const rejectionRate = total > 0 ? ((rejections / total) * 100).toFixed(1) : 0;
        setStats({ total, saved, applied, interviews, offers, rejections, active, offerRate, rejectionRate });
      } catch {
        setError('Unable to load dashboard stats right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const barData = [
    { name: 'Saved', value: stats.saved || 0 },
    { name: 'Applied', value: stats.applied || 0 },
    { name: 'Interview', value: stats.interviews || 0 },
    { name: 'Offer', value: stats.offers || 0 },
    { name: 'Rejected', value: stats.rejections || 0 },
  ];

  const pieData = barData.filter((d) => d.value > 0);
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0))
    .slice(0, 5);

  const upcoming = getUpcomingInterviews(applications);
  const deadlineAlerts = getDeadlineAlerts(applications);

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track your progress from application to offer.</p>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div className="stats-grid">
        <article className="stat-card">
          <p>Total Applications</p>
          <h3>{loading ? '...' : stats.total || 0}</h3>
        </article>
        <article className="stat-card">
          <p>Active</p>
          <h3>{loading ? '...' : stats.active || 0}</h3>
          <p className="stat-accent">Applied + Interview</p>
        </article>
        <article className="stat-card">
          <p>Interviews</p>
          <h3>{loading ? '...' : stats.interviews || 0}</h3>
        </article>
        <article className="stat-card">
          <p>Offers</p>
          <h3>{loading ? '...' : stats.offers || 0}</h3>
          <p className="stat-accent">{stats.offerRate || 0}% rate</p>
        </article>
        <article className="stat-card">
          <p>Rejections</p>
          <h3>{loading ? '...' : stats.rejections || 0}</h3>
          <p className="stat-accent">{stats.rejectionRate || 0}% rate</p>
        </article>
        <article className="stat-card">
          <p>Saved Jobs</p>
          <h3>{loading ? '...' : stats.saved || 0}</h3>
        </article>
      </div>

      <div className="dashboard-row-two">
        <section className="panel reminder-panel">
          <div className="panel-title">
            <h2>Upcoming interviews</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="muted">No scheduled interviews. Add an interview date on an application to see reminders here.</p>
          ) : (
            <div className="reminder-list">
              {upcoming.map((app) => {
                const u = getInterviewUrgency(app.interviewDate);
                return (
                  <Link to={`/applications/${app._id}`} key={app._id} className="reminder-item">
                    <div>
                      <strong>{app.company}</strong>
                      <p className="muted">{app.role}</p>
                      <p className="reminder-time">
                        {new Date(app.interviewDate).toLocaleString()}
                      </p>
                    </div>
                    {u && (
                      <span
                        className={`reminder-pill ${
                          u.level === 'urgent' ? 'is-urgent' : u.level === 'soon' ? 'is-soon' : 'is-ok'
                        }`}
                      >
                        {u.level === 'urgent' ? 'Urgent' : u.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel reminder-panel">
          <div className="panel-title">
            <h2>Application deadlines</h2>
          </div>
          {deadlineAlerts.length === 0 ? (
            <p className="muted">No urgent or expired deadlines. Deadlines within 3 days or past due show here.</p>
          ) : (
            <div className="reminder-list">
              {deadlineAlerts.map(({ app, insight }) => (
                <Link to={`/applications/${app._id}`} key={app._id} className="reminder-item">
                  <div>
                    <strong>{app.company}</strong>
                    <p className="muted">{app.role}</p>
                    <p className="reminder-time">
                      {app.deadline ? new Date(app.deadline).toLocaleString() : ''}
                    </p>
                  </div>
                  {insight && (
                    <span
                      className={`reminder-pill ${
                        insight.tone === 'danger' ? 'is-danger' : insight.tone === 'urgent' ? 'is-urgent' : 'is-warn'
                      }`}
                    >
                      {insight.label}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-charts-grid">
        <section className="panel">
          <div className="panel-title">
            <h2>Status Breakdown</h2>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
                <XAxis dataKey="name" stroke="#8ca2bd" />
                <YAxis stroke="#8ca2bd" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111c2a', border: '1px solid #1f2b3b', borderRadius: '10px', color: '#f5f9ff' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <h2>Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`pie-${index}`} fill={COLORS[barData.findIndex(b => b.name === entry.name) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111c2a', border: '1px solid #1f2b3b', borderRadius: '10px', color: '#f5f9ff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="panel">
        <div className="panel-title">
          <h2>Recent Applications</h2>
          <Link to="/applications" className="inline-link" style={{ fontSize: '0.88rem' }}>View All →</Link>
        </div>
        {recentApps.length === 0 ? (
          <p className="muted">No applications yet. Start tracking your journey!</p>
        ) : (
          <div className="recent-list">
            {recentApps.map((app) => (
              <Link to={`/applications/${app._id}`} key={app._id} className="recent-item" style={{ textDecoration: 'none' }}>
                <div className="recent-item-info">
                  <h4>{app.company}</h4>
                  <p>{app.role}</p>
                </div>
                <span className={`badge ${app.status || 'applied'}`}>{app.status || 'applied'}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default Dashboard;
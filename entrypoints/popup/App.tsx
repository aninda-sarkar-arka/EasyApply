import { useEffect, useState } from 'react';
import * as applicationsRepo from '../../src/db/repositories/applications';
import type { Application, ApplicationStatus } from '../../src/db/schema';

interface Stats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  thisWeek: number;
}

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  saved:     '#94A3B8',
  applied:   '#7C3AED',
  interview: '#F59E0B',
  offer:     '#10B981',
  rejected:  '#EF4444',
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
};

function LogoMark() {
  return (
    <img
      src="logo-sm.png"
      alt="EasyApply"
      style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }}
    />
  );
}

function StatPill({
  value, label, color,
}: { value: number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <span style={{ fontSize: '1.35rem', fontWeight: 800, color, lineHeight: 1.1 }}>
        {value}
      </span>
      <span style={{ fontSize: '0.65rem', color: '#64748B', marginTop: 2, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span style={{
      fontSize: '0.63rem', fontWeight: 700, padding: '2px 8px',
      borderRadius: 20, background: `${color}1A`, color,
      flexShrink: 0, letterSpacing: '0.2px',
    }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function AppRow({ app }: { app: Application }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', marginBottom: 5,
      background: 'white', borderRadius: 10,
      border: '1px solid #E2E8F0',
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: STATUS_COLOR[app.status],
        boxShadow: `0 0 0 2px ${STATUS_COLOR[app.status]}30`,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: 600, color: '#0F172A',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {app.company}
        </div>
        <div style={{
          fontSize: '0.7rem', color: '#64748B',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {app.role || 'No title'}
        </div>
      </div>
      <StatusBadge status={app.status}/>
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsRepo.getAll().then((apps) => {
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      setStats({
        total:     apps.length,
        applied:   apps.filter(a => a.status === 'applied').length,
        interview: apps.filter(a => a.status === 'interview').length,
        offer:     apps.filter(a => a.status === 'offer').length,
        rejected:  apps.filter(a => a.status === 'rejected').length,
        thisWeek:  apps.filter(a => now - new Date(a.appliedDate).getTime() < weekMs).length,
      });
      setRecent(apps.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function openDashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browser as any).tabs.create({ url: browser.runtime.getURL('/dashboard.html') });
  }

  function openLinkedIn() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browser as any).tabs.create({ url: 'https://www.linkedin.com/jobs/' });
  }

  const total = stats?.total ?? 0;
  const thisWeek = stats?.thisWeek ?? 0;

  return (
    <div style={{
      width: 360,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#F1F5F9',
      minHeight: 'fit-content',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0e2244 0%, #1c0b42 100%)',
        padding: '18px 20px 20px',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <LogoMark/>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
              EasyApply
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: 1 }}>
              Job Application Tracker
            </div>
          </div>
        </div>

        {/* Big total */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
            {loading ? '—' : total}
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.95 }}>
              Total Applications
            </div>
            <div style={{ fontSize: '0.68rem', opacity: 0.72, marginTop: 1 }}>
              {loading ? '' : `+${thisWeek} this week`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status breakdown ── */}
      <div style={{
        background: 'white',
        display: 'flex', alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <StatPill value={loading ? 0 : stats?.applied   ?? 0} label="Applied"   color="#7d54ff"/>
        <div style={{ width: 1, alignSelf: 'stretch', background: '#E2E8F0', margin: '0 2px' }}/>
        <StatPill value={loading ? 0 : stats?.interview ?? 0} label="Interview" color="#F59E0B"/>
        <div style={{ width: 1, alignSelf: 'stretch', background: '#E2E8F0', margin: '0 2px' }}/>
        <StatPill value={loading ? 0 : stats?.offer     ?? 0} label="Offer"     color="#10B981"/>
        <div style={{ width: 1, alignSelf: 'stretch', background: '#E2E8F0', margin: '0 2px' }}/>
        <StatPill value={loading ? 0 : stats?.rejected  ?? 0} label="Rejected"  color="#EF4444"/>
      </div>

      {/* ── Recent applications ── */}
      <div style={{ padding: '12px 14px 6px' }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8,
        }}>
          Recent
        </div>

        {loading && (
          <div style={{ padding: '14px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>
            Loading…
          </div>
        )}

        {!loading && recent.length === 0 && (
          <div style={{
            padding: '14px 12px', background: 'white', borderRadius: 10,
            border: '1px solid #E2E8F0', textAlign: 'center',
            color: '#94A3B8', fontSize: '0.78rem', lineHeight: 1.5,
          }}>
            No applications yet.<br/>
            Browse LinkedIn jobs and start applying!
          </div>
        )}

        {recent.map(app => <AppRow key={app.id} app={app}/>)}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ padding: '8px 14px 16px', display: 'flex', gap: 8 }}>
        <button
          onClick={openDashboard}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
            background: '#7d54ff', color: 'white',
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(125,84,255,0.30)',
          }}
        >
          Open Dashboard
        </button>
        <button
          onClick={openLinkedIn}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 10,
            border: '1.5px solid #E2E8F0', background: 'white',
            color: '#7d54ff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          Browse Jobs
        </button>
      </div>

    </div>
  );
}

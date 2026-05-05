const MS_DAY = 86400000;

/** Local datetime-local value from ISO or Date */
export function toDatetimeLocalValue(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function getDeadlineInsight(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const days = Math.ceil(diffMs / MS_DAY);
  if (diffMs < 0) {
    return { label: 'Deadline passed', tone: 'danger' };
  }
  if (days <= 1) {
    return { label: 'Due within 24h', tone: 'urgent' };
  }
  if (days <= 3) {
    return { label: `Due in ${days}d`, tone: 'warn' };
  }
  return { label: d.toLocaleDateString(), tone: 'muted' };
}

/**
 * @returns { 'urgent' | 'soon' | 'ok' | null } urgent = within 48h, soon = within 7d
 */
export function getInterviewUrgency(interviewDate) {
  if (!interviewDate) return null;
  const t = new Date(interviewDate).getTime();
  if (Number.isNaN(t)) return null;
  const now = Date.now();
  const diff = t - now;
  if (diff < 0) return { level: 'past', label: 'Past' };
  if (diff <= 48 * 3600000) return { level: 'urgent', label: 'Soon' };
  if (diff <= 7 * MS_DAY) return { level: 'soon', label: 'This week' };
  return { level: 'ok', label: 'Upcoming' };
}

/** Applications with interviewDate in the future, sorted soonest first */
export function getUpcomingInterviews(applications, now = new Date()) {
  return (applications || [])
    .filter((a) => a.interviewDate && new Date(a.interviewDate) > now)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
}

export function getDeadlineAlerts(applications, now = new Date()) {
  return (applications || [])
    .filter((a) => a.deadline)
    .map((a) => ({ app: a, insight: getDeadlineInsight(a.deadline) }))
    .filter((x) => x.insight && (x.insight.tone === 'danger' || x.insight.tone === 'urgent' || x.insight.tone === 'warn'));
}

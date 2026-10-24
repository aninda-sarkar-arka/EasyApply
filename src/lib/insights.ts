const MS_DAY = 86_400_000;

export type DeadlineTone = 'danger' | 'urgent' | 'warn' | 'muted';
export type UrgencyLevel = 'urgent' | 'soon' | 'ok' | 'past';

export interface DeadlineInsight {
  label: string;
  tone: DeadlineTone;
}

export interface InterviewUrgency {
  level: UrgencyLevel;
  label: string;
}

/** Convert an ISO string or Date to a datetime-local input value (YYYY-MM-DDTHH:MM). */
export function toDatetimeLocalValue(isoOrDate: string | Date | undefined | null): string {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Return deadline status, or null if deadline is absent or invalid. */
export function getDeadlineInsight(deadline: string | undefined | null): DeadlineInsight | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = d.getTime() - Date.now();
  const days = Math.ceil(diffMs / MS_DAY);
  if (diffMs < 0) return { label: 'Deadline passed', tone: 'danger' };
  if (days <= 1) return { label: 'Due within 24h', tone: 'urgent' };
  if (days <= 3) return { label: `Due in ${days}d`, tone: 'warn' };
  return { label: d.toLocaleDateString(), tone: 'muted' };
}

/** Return interview urgency, or null if date is absent or invalid. */
export function getInterviewUrgency(interviewDate: string | undefined | null): InterviewUrgency | null {
  if (!interviewDate) return null;
  const t = new Date(interviewDate).getTime();
  if (Number.isNaN(t)) return null;
  const diff = t - Date.now();
  if (diff < 0) return { level: 'past', label: 'Past' };
  if (diff <= 48 * 3_600_000) return { level: 'urgent', label: 'Soon' };
  if (diff <= 7 * MS_DAY) return { level: 'soon', label: 'This week' };
  return { level: 'ok', label: 'Upcoming' };
}

export interface HasInterviewDate {
  id?: number;
  company: string;
  role: string;
  interviewDate?: string;
}

export interface HasDeadline {
  id?: number;
  company: string;
  role: string;
  deadline?: string;
}

export interface DeadlineAlert<T extends HasDeadline> {
  app: T;
  insight: DeadlineInsight;
}

/** Applications with interviewDate in the future, sorted soonest first. */
export function getUpcomingInterviews<T extends HasInterviewDate>(
  applications: T[],
  now = new Date(),
): T[] {
  return applications
    .filter((a) => a.interviewDate && new Date(a.interviewDate) > now)
    .sort(
      (a, b) =>
        new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime(),
    );
}

/** Applications with urgent/warning/past deadlines (within 3 days or overdue). */
export function getDeadlineAlerts<T extends HasDeadline>(
  applications: T[],
): DeadlineAlert<T>[] {
  return applications
    .filter((a) => a.deadline)
    .map((a) => ({ app: a, insight: getDeadlineInsight(a.deadline) }))
    .filter((x): x is DeadlineAlert<T> =>
      x.insight !== null &&
      (x.insight.tone === 'danger' ||
        x.insight.tone === 'urgent' ||
        x.insight.tone === 'warn'),
    );
}

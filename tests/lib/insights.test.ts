import { describe, it, expect } from 'vitest';
import {
  toDatetimeLocalValue,
  getDeadlineInsight,
  getInterviewUrgency,
  getUpcomingInterviews,
  getDeadlineAlerts,
} from '../../src/lib/insights';

describe('toDatetimeLocalValue', () => {
  it('returns empty string for null', () => {
    expect(toDatetimeLocalValue(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(toDatetimeLocalValue(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(toDatetimeLocalValue('')).toBe('');
  });

  it('returns empty string for an invalid date string', () => {
    expect(toDatetimeLocalValue('not-a-date')).toBe('');
  });

  it('returns a YYYY-MM-DDTHH:MM formatted string for a valid ISO date', () => {
    const result = toDatetimeLocalValue('2025-06-15T00:00:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe('getDeadlineInsight', () => {
  it('returns null for null deadline', () => {
    expect(getDeadlineInsight(null)).toBeNull();
  });

  it('returns null for undefined deadline', () => {
    expect(getDeadlineInsight(undefined)).toBeNull();
  });

  it('returns null for an invalid date string', () => {
    expect(getDeadlineInsight('not-a-date')).toBeNull();
  });

  it('returns danger tone for a past deadline', () => {
    const past = new Date(Date.now() - 86_400_000 * 2).toISOString();
    expect(getDeadlineInsight(past)?.tone).toBe('danger');
    expect(getDeadlineInsight(past)?.label).toBe('Deadline passed');
  });

  it('returns urgent tone for a deadline within 24h', () => {
    const soon = new Date(Date.now() + 3_600_000 * 12).toISOString();
    expect(getDeadlineInsight(soon)?.tone).toBe('urgent');
  });

  it('returns warn tone for a deadline within 3 days', () => {
    const warn = new Date(Date.now() + 86_400_000 * 2).toISOString();
    expect(getDeadlineInsight(warn)?.tone).toBe('warn');
  });

  it('returns muted tone for a deadline beyond 3 days', () => {
    const future = new Date(Date.now() + 86_400_000 * 10).toISOString();
    expect(getDeadlineInsight(future)?.tone).toBe('muted');
  });
});

describe('getInterviewUrgency', () => {
  it('returns null for null date', () => {
    expect(getInterviewUrgency(null)).toBeNull();
  });

  it('returns null for undefined date', () => {
    expect(getInterviewUrgency(undefined)).toBeNull();
  });

  it('returns past level for an interview that already happened', () => {
    const past = new Date(Date.now() - 3_600_000).toISOString();
    expect(getInterviewUrgency(past)?.level).toBe('past');
  });

  it('returns urgent level for an interview within 48h', () => {
    const soon = new Date(Date.now() + 3_600_000 * 24).toISOString();
    expect(getInterviewUrgency(soon)?.level).toBe('urgent');
  });

  it('returns soon level for an interview within 7 days', () => {
    const thisWeek = new Date(Date.now() + 86_400_000 * 4).toISOString();
    expect(getInterviewUrgency(thisWeek)?.level).toBe('soon');
  });

  it('returns ok level for an interview beyond 7 days', () => {
    const future = new Date(Date.now() + 86_400_000 * 14).toISOString();
    expect(getInterviewUrgency(future)?.level).toBe('ok');
  });
});

describe('getUpcomingInterviews', () => {
  it('returns only future interviews', () => {
    const now = new Date();
    const apps = [
      { id: 1, company: 'A', role: 'Eng', interviewDate: new Date(Date.now() + 86_400_000).toISOString() },
      { id: 2, company: 'B', role: 'Eng', interviewDate: new Date(Date.now() - 86_400_000).toISOString() },
      { id: 3, company: 'C', role: 'Eng' },
    ];
    const result = getUpcomingInterviews(apps, now);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(1);
  });

  it('sorts future interviews by date ascending (soonest first)', () => {
    const now = new Date();
    const apps = [
      { id: 1, company: 'A', role: 'Eng', interviewDate: new Date(Date.now() + 86_400_000 * 3).toISOString() },
      { id: 2, company: 'B', role: 'Eng', interviewDate: new Date(Date.now() + 86_400_000).toISOString() },
    ];
    const result = getUpcomingInterviews(apps, now);
    expect(result[0]!.id).toBe(2);
    expect(result[1]!.id).toBe(1);
  });

  it('returns empty array when there are no upcoming interviews', () => {
    const apps = [{ id: 1, company: 'A', role: 'Eng' }];
    expect(getUpcomingInterviews(apps)).toHaveLength(0);
  });
});

describe('getDeadlineAlerts', () => {
  it('excludes applications without a deadline', () => {
    expect(getDeadlineAlerts([{ id: 1, company: 'A', role: 'E' }])).toHaveLength(0);
  });

  it('excludes applications with a muted deadline (far future)', () => {
    const apps = [
      { id: 1, company: 'A', role: 'E', deadline: new Date(Date.now() + 86_400_000 * 30).toISOString() },
    ];
    expect(getDeadlineAlerts(apps)).toHaveLength(0);
  });

  it('includes applications with an urgent deadline (within 24h)', () => {
    const apps = [
      { id: 1, company: 'A', role: 'E', deadline: new Date(Date.now() + 3_600_000 * 6).toISOString() },
    ];
    expect(getDeadlineAlerts(apps)).toHaveLength(1);
    expect(getDeadlineAlerts(apps)[0]!.insight.tone).toBe('urgent');
  });

  it('includes applications with a past deadline', () => {
    const apps = [
      { id: 1, company: 'A', role: 'E', deadline: new Date(Date.now() - 86_400_000).toISOString() },
    ];
    const alerts = getDeadlineAlerts(apps);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.insight.tone).toBe('danger');
  });

  it('includes applications with a warn deadline (within 3 days)', () => {
    const apps = [
      { id: 1, company: 'A', role: 'E', deadline: new Date(Date.now() + 86_400_000 * 2).toISOString() },
    ];
    expect(getDeadlineAlerts(apps)[0]!.insight.tone).toBe('warn');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import { importFromJsonText } from '../../src/lib/export';
import type { ExportData } from '../../src/lib/export';

function makeExportJson(overrides: Partial<ExportData> = {}): string {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    applications: [],
    resumes: [],
    settings: [],
    ...overrides,
  };
  return JSON.stringify(data);
}

beforeEach(async () => {
  await Promise.all([db.applications.clear(), db.resumes.clear(), db.settings.clear()]);
});

describe('importFromJsonText', () => {
  it('rejects non-JSON input', async () => {
    await expect(importFromJsonText('not json')).rejects.toThrow('not valid JSON');
  });

  it('rejects input missing the version field', async () => {
    await expect(
      importFromJsonText(JSON.stringify({ applications: [], resumes: [], settings: [] })),
    ).rejects.toThrow('does not look like an EasyApply export');
  });

  it('rejects input with wrong version', async () => {
    await expect(
      importFromJsonText(JSON.stringify({ version: 2, applications: [], resumes: [], settings: [] })),
    ).rejects.toThrow('does not look like an EasyApply export');
  });

  it('imports applications from a valid export', async () => {
    const json = makeExportJson({
      applications: [
        {
          id: 1,
          company: 'Acme',
          role: 'Engineer',
          status: 'applied',
          appliedDate: new Date().toISOString(),
          activityLog: [],
          interviewNotes: [],
        },
      ],
    });
    const result = await importFromJsonText(json);
    expect(result.applicationsImported).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(await db.applications.count()).toBe(1);
  });

  it('clears existing data before importing', async () => {
    await db.applications.add({
      company: 'Old',
      role: 'Dev',
      status: 'saved',
      appliedDate: new Date().toISOString(),
      activityLog: [],
      interviewNotes: [],
    });
    expect(await db.applications.count()).toBe(1);

    await importFromJsonText(makeExportJson());
    expect(await db.applications.count()).toBe(0);
  });

  it('imports settings from a valid export', async () => {
    const json = makeExportJson({
      settings: [{ key: 'provider', value: 'openai' }],
    });
    await importFromJsonText(json);
    const setting = await db.settings.get('provider');
    expect(setting?.value).toBe('openai');
  });

  it('returns correct counts for applications and resumes', async () => {
    const json = makeExportJson({
      applications: [
        {
          id: 1,
          company: 'A',
          role: 'R',
          status: 'applied',
          appliedDate: new Date().toISOString(),
          activityLog: [],
          interviewNotes: [],
        },
        {
          id: 2,
          company: 'B',
          role: 'R',
          status: 'interview',
          appliedDate: new Date().toISOString(),
          activityLog: [],
          interviewNotes: [],
        },
      ],
      resumes: [
        {
          id: 1,
          filename: 'cv.pdf',
          originalName: 'CV.pdf',
          uploadDate: new Date().toISOString(),
        },
      ],
    });
    const result = await importFromJsonText(json);
    expect(result.applicationsImported).toBe(2);
    expect(result.resumesImported).toBe(1);
  });
});

import { db } from '../db/schema';
import type { Application, Resume, Setting } from '../db/schema';

export interface ExportData {
  version: 1;
  exportedAt: string;
  applications: Application[];
  resumes: Resume[];
  settings: Setting[];
}

/** Serialize all DB tables to a JSON file and trigger a browser download. */
export async function exportToJson(): Promise<void> {
  const [applications, resumes, settings] = await Promise.all([
    db.applications.toArray(),
    db.resumes.toArray(),
    db.settings.toArray(),
  ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    applications,
    resumes,
    settings,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `easyapply-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  applicationsImported: number;
  resumesImported: number;
  errors: string[];
}

/**
 * Replace all DB contents with data from a JSON export file.
 * The caller is responsible for confirming with the user before calling this.
 */
export async function importFromJson(file: File): Promise<ImportResult> {
  return importFromJsonText(await file.text());
}

/**
 * Same as importFromJson but accepts the raw JSON string directly.
 * Exported for unit tests that cannot construct a real File object in jsdom.
 */
export async function importFromJsonText(jsonText: string): Promise<ImportResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (!isExportData(raw)) {
    throw new Error('File does not look like an EasyApply export (missing version or table arrays).');
  }

  const errors: string[] = [];

  await db.transaction('rw', db.applications, db.resumes, db.settings, async () => {
    await Promise.all([db.applications.clear(), db.resumes.clear(), db.settings.clear()]);
    await db.applications.bulkPut(raw.applications).catch((e: unknown) =>
      errors.push(`applications bulk put: ${String(e)}`),
    );
    await db.resumes.bulkPut(raw.resumes).catch((e: unknown) =>
      errors.push(`resumes bulk put: ${String(e)}`),
    );
    await db.settings.bulkPut(raw.settings).catch((e: unknown) =>
      errors.push(`settings bulk put: ${String(e)}`),
    );
  });

  return {
    applicationsImported: raw.applications.length,
    resumesImported: raw.resumes.length,
    errors,
  };
}

function isExportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d['version'] === 1 &&
    Array.isArray(d['applications']) &&
    Array.isArray(d['resumes']) &&
    Array.isArray(d['settings'])
  );
}

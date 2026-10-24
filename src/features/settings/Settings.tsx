import { useState } from 'react';
import { exportToJson, importFromJson } from '../../lib/export';

interface ImportResult {
  ok: boolean;
  message: string;
}

export default function Settings() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleExport = async () => {
    try {
      await exportToJson();
      setResult({ ok: true, message: 'Export downloaded successfully.' });
    } catch {
      setResult({ ok: false, message: 'Export failed. Please try again.' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        'This will replace ALL existing applications, resumes, and settings with the data from the file. This cannot be undone. Continue?',
      )
    ) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const { applicationsImported, resumesImported, errors } = await importFromJson(file);
      if (errors.length > 0) {
        setResult({
          ok: false,
          message: `Imported with errors: ${errors.join('; ')}`,
        });
      } else {
        setResult({
          ok: true,
          message: `Import complete: ${applicationsImported} application${applicationsImported !== 1 ? 's' : ''} and ${resumesImported} resume${resumesImported !== 1 ? 's' : ''} restored.`,
        });
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Import failed.',
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your data and backup preferences.</p>
      </div>

      <section className="panel">
        <div className="panel-title">
          <h2>Data backup and restore</h2>
        </div>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          All your data is stored locally in this browser. Export it regularly as a backup. To
          move data to a new browser or device, export here and import on the other side.
        </p>

        {result && (
          <div className={`notice${result.ok ? '' : ' error'}`} style={{ marginBottom: '1rem' }}>
            {result.message}
          </div>
        )}

        <div className="row-actions">
          <button className="nav-cta" onClick={handleExport}>
            Export to JSON
          </button>

          <label
            className={`nav-cta ghost${importing ? ' disabled' : ''}`}
            style={{ cursor: importing ? 'not-allowed' : 'pointer' }}
          >
            {importing ? 'Importing...' : 'Import from JSON'}
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
              disabled={importing}
            />
          </label>
        </div>
      </section>
    </section>
  );
}

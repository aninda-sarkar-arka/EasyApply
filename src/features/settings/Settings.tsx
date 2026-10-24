import { useState, useEffect } from 'react';
import { exportToJson, importFromJson } from '../../lib/export';
import { validateKey } from '../../ai/index';
import type { AIProvider, AITier } from '../../ai/types';
import * as settingsRepo from '../../db/repositories/settings';

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI (GPT-4o)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'gemini', label: 'Google Gemini' },
];

const TIERS: { value: AITier; label: string; description: string }[] = [
  { value: 'fast', label: 'Fast', description: 'Faster and cheaper. Recommended for most tasks.' },
  { value: 'smart', label: 'Smart', description: 'Most capable model. Better for complex analysis.' },
];

interface ImportResult {
  ok: boolean;
  message: string;
}

export default function Settings() {
  const [importing, setImporting] = useState(false);
  const [dataResult, setDataResult] = useState<ImportResult | null>(null);

  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [tier, setTier] = useState<AITier>('fast');
  const [keyVisible, setKeyVisible] = useState(false);
  const [testing, setTesting] = useState(false);
  const [keyResult, setKeyResult] = useState<ImportResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const [p, k, t] = await Promise.all([
        settingsRepo.get('ai.provider'),
        settingsRepo.get('ai.apiKey'),
        settingsRepo.get('ai.tier'),
      ]);
      if (p) setProvider(p as AIProvider);
      if (k) setApiKey(k);
      if (t) setTier(t as AITier);
    })();
  }, []);

  const saveAISettings = async () => {
    setSaving(true);
    setKeyResult(null);
    try {
      await Promise.all([
        settingsRepo.set('ai.provider', provider),
        settingsRepo.set('ai.apiKey', apiKey),
        settingsRepo.set('ai.tier', tier),
      ]);
      setKeyResult({ ok: true, message: 'Settings saved.' });
    } catch {
      setKeyResult({ ok: false, message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const testKey = async () => {
    if (!apiKey.trim()) {
      setKeyResult({ ok: false, message: 'Enter an API key first.' });
      return;
    }
    setTesting(true);
    setKeyResult(null);
    try {
      const valid = await validateKey(provider, apiKey.trim());
      setKeyResult(valid
        ? { ok: true, message: `${provider} key is valid.` }
        : { ok: false, message: `${provider} key was rejected. Check the key and try again.` });
    } catch {
      setKeyResult({ ok: false, message: 'Could not reach the AI provider. Check your connection.' });
    } finally {
      setTesting(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportToJson();
      setDataResult({ ok: true, message: 'Export downloaded successfully.' });
    } catch {
      setDataResult({ ok: false, message: 'Export failed. Please try again.' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('This will replace ALL existing applications, resumes, and settings with the data from the file. This cannot be undone. Continue?')) {
      e.target.value = '';
      return;
    }
    setImporting(true);
    setDataResult(null);
    try {
      const { applicationsImported, resumesImported, errors } = await importFromJson(file);
      setDataResult(errors.length > 0
        ? { ok: false, message: `Imported with errors: ${errors.join('; ')}` }
        : { ok: true, message: `Import complete: ${applicationsImported} application${applicationsImported !== 1 ? 's' : ''} and ${resumesImported} resume${resumesImported !== 1 ? 's' : ''} restored.` });
    } catch (err) {
      setDataResult({ ok: false, message: err instanceof Error ? err.message : 'Import failed.' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure AI tools and manage your data.</p>
      </div>

      {/* AI settings */}
      <section className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-title">
          <h2>AI Tools</h2>
        </div>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          EasyApply uses your own API key. Your key and data never leave this device (except calls you make to the chosen provider). Leave blank to use the app without AI features.
        </p>

        <div className="form-stack">
          <div className="form-row">
            <div className="form-group">
              <label>Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value as AIProvider)}>
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Model tier</label>
              <select value={tier} onChange={(e) => setTier(e.target.value as AITier)}>
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>API Key</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={keyVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste your ${provider} API key here`}
                style={{ flex: 1 }}
                autoComplete="off"
              />
              <button
                type="button"
                className="copy-btn"
                onClick={() => setKeyVisible(!keyVisible)}
              >
                {keyVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {keyResult && (
            <div className={`notice${keyResult.ok ? '' : ' error'}`}>{keyResult.message}</div>
          )}

          <div className="row-actions">
            <button className="nav-cta ghost" onClick={testKey} disabled={testing}>
              {testing ? 'Testing...' : 'Test Key'}
            </button>
            <button className="nav-cta" onClick={saveAISettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save AI Settings'}
            </button>
          </div>
        </div>
      </section>

      {/* Data backup */}
      <section className="panel">
        <div className="panel-title">
          <h2>Data backup and restore</h2>
        </div>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          All your data is stored locally in this browser. Export regularly as a backup, or import to restore on a new device.
        </p>

        {dataResult && (
          <div className={`notice${dataResult.ok ? '' : ' error'}`} style={{ marginBottom: '1rem' }}>
            {dataResult.message}
          </div>
        )}

        <div className="row-actions">
          <button className="nav-cta" onClick={handleExport}>Export to JSON</button>
          <label className={`nav-cta ghost${importing ? ' disabled' : ''}`} style={{ cursor: importing ? 'not-allowed' : 'pointer' }}>
            {importing ? 'Importing...' : 'Import from JSON'}
            <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImport} disabled={importing} />
          </label>
        </div>
      </section>
    </section>
  );
}

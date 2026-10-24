import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as applicationsRepository from '../../db/repositories/applications';
import type { Application, InterviewNote } from '../../db/schema';

interface NoteWithApp {
  note: InterviewNote;
  app: Application;
}

export default function NoteManagement() {
  const [notes, setNotes] = useState<NoteWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const apps = await applicationsRepository.getAll();
      const all: NoteWithApp[] = [];
      for (const app of apps) {
        for (const note of app.interviewNotes) {
          all.push({ note, app });
        }
      }
      // Most recent notes first
      all.sort((a, b) => new Date(b.note.date).getTime() - new Date(a.note.date).getTime());
      setNotes(all);
    } catch {
      setError('Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const deleteNote = async (appId: number, noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await applicationsRepository.removeInterviewNote(appId, noteId);
      await load();
    } catch {
      setError('Failed to delete note.');
    }
  };

  const filtered = search.trim()
    ? notes.filter(({ note, app }) => {
        const q = search.trim().toLowerCase();
        return (
          note.question.toLowerCase().includes(q) ||
          note.answer.toLowerCase().includes(q) ||
          note.feedback.toLowerCase().includes(q) ||
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q)
        );
      })
    : notes;

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Interview Notes</h1>
        <p>All your notes across every application in one place.</p>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div className="search-bar-wrap">
        <input
          type="search"
          className="search-input"
          placeholder="Search notes by question, answer, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search notes"
        />
      </div>

      {loading && <div className="notice">Loading...</div>}

      {!loading && filtered.length === 0 && (
        <div className="panel empty-state">
          <h3>No notes found</h3>
          <p>
            {search.trim()
              ? 'No notes match your search.'
              : 'Add interview notes from any application detail page.'}
          </p>
        </div>
      )}

      <div className="card-list">
        {filtered.map(({ note, app }) => (
          <article className="panel note-card" key={note.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <Link
                  to={`/applications/${app.id}`}
                  className="inline-link"
                  style={{ fontSize: '0.82rem' }}
                >
                  {app.company} — {app.role}
                </Link>
                <h4 style={{ margin: '4px 0 8px' }}>Q: {note.question}</h4>
              </div>
              <button
                className="remove-btn"
                onClick={() => app.id !== undefined && deleteNote(app.id, note.id)}
              >
                ×
              </button>
            </div>
            {note.answer && (
              <p>
                <strong style={{ color: '#6ea8fe' }}>Answer:</strong> {note.answer}
              </p>
            )}
            {note.feedback && (
              <p>
                <strong style={{ color: '#ffe29f' }}>Feedback:</strong> {note.feedback}
              </p>
            )}
            <p className="note-meta">{new Date(note.date).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

/**
 * NoteManagement page – aggregates interview notes from all applications.
 * Users can view, add, and delete notes. Each note is linked back to the
 * originating application for context.
 */
const NoteManagement = () => {
  const [applications, setApplications] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for adding a new note
  const [newNote, setNewNote] = useState({
    appId: '',
    question: '',
    answer: '',
    feedback: '',
  });

  // Fetch all applications (including interviewNotes)
  const fetchApplications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/applications');
      setApplications(res.data);
      // Flatten all notes with reference to their parent application
      const allNotes = [];
      res.data.forEach((app) => {
        if (Array.isArray(app.interviewNotes)) {
          app.interviewNotes.forEach((note) => {
            allNotes.push({
              ...note,
              appId: app._id,
              company: app.company,
              role: app.role,
            });
          });
        }
      });
      setNotes(allNotes);
    } catch (e) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (appId, noteId) => {
    if (!window.confirm('Delete this interview note?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/applications/${appId}/interview-notes/${noteId}`);
      // Refresh list after delete
      fetchApplications();
    } catch (e) {
      setError('Failed to delete note');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    const { appId, question, answer, feedback } = newNote;
    if (!appId) {
      setError('Select an application first');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/applications/${appId}/interview-notes`, {
        question,
        answer,
        feedback,
      });
      setNewNote({ appId: '', question: '', answer: '', feedback: '' });
      fetchApplications();
    } catch (e) {
      setError('Failed to add note');
    }
  };

  if (loading) return (<section className="page page-content"><div className="notice">Loading notes…</div></section>);

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Interview Note Management</h1>
        <p>All interview notes across your applications in one place.</p>
      </div>

      {error && <div className="notice error">{error}</div>}

      {/* Add Note Form */}
      <div className="panel">
        <h2>Add New Note</h2>
        <form className="form-stack" onSubmit={handleAddNote}>
          <div className="form-group">
            <label>Application *</label>
            <select
              value={newNote.appId}
              onChange={(e) => setNewNote({ ...newNote, appId: e.target.value })}
              required
            >
              <option value="">-- Select --</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.company} – {app.role}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Question Asked</label>
            <input
              type="text"
              value={newNote.question}
              onChange={(e) => setNewNote({ ...newNote, question: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Answer / Response</label>
            <textarea
              rows={2}
              value={newNote.answer}
              onChange={(e) => setNewNote({ ...newNote, answer: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Feedback / Notes</label>
            <textarea
              rows={2}
              value={newNote.feedback}
              onChange={(e) => setNewNote({ ...newNote, feedback: e.target.value })}
            />
          </div>
          <button type="submit" className="nav-cta">Add Note</button>
        </form>
      </div>

      {/* Notes List */}
      <div className="panel">
        <h2>All Notes</h2>
        {notes.length === 0 ? (
          <p className="muted">No interview notes yet.</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note._id} className="note-card">
                <div className="note-header">
                  <strong>{note.question || 'Untitled'}</strong>
                  <button
                    className="remove-btn"
                    onClick={() => handleDelete(note.appId, note._id)}
                  >
                    × Delete
                  </button>
                </div>
                <p><strong>Application:</strong> {note.company} – {note.role}</p>
                {note.answer && <p><strong>Answer:</strong> {note.answer}</p>}
                {note.feedback && <p><strong>Feedback:</strong> {note.feedback}</p>}
                <p className="note-meta">{new Date(note.date).toLocaleString()}</p>
                <Link to={`/applications/${note.appId}`} className="inline-link">
                  View Application →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default NoteManagement;

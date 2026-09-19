const Application = require('../models/Application');

/**
 * Get all interview notes for the logged‑in user across all applications.
 */
exports.getAllNotes = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id })
      .select('company role interviewNotes')
      .lean();

    const notes = apps.flatMap(app =>
      (app.interviewNotes || []).map(note => ({
        appId: app._id,
        company: app.company,
        role: app.role,
        noteId: note._id,
        question: note.question,
        answer: note.answer,
        feedback: note.feedback,
        date: note.date
      }))
    );
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/** Add a new interview note to a specific application */
exports.createNote = async (req, res) => {
  const { appId } = req.params;
  const { question, answer, feedback } = req.body;
  try {
    const app = await Application.findOne({ _id: appId, user: req.user.id });
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    app.interviewNotes.push({ question, answer, feedback });
    app.activityLog.push({ action: `Interview note added: ${question?.slice(0, 30)}` });
    await app.save();
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/** Update an existing interview note */
exports.updateNote = async (req, res) => {
  const { appId, noteId } = req.params;
  const { question, answer, feedback } = req.body;
  try {
    const app = await Application.findOne({ _id: appId, user: req.user.id });
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    const note = app.interviewNotes.id(noteId);
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    if (question !== undefined) note.question = question;
    if (answer !== undefined) note.answer = answer;
    if (feedback !== undefined) note.feedback = feedback;
    app.activityLog.push({ action: `Interview note updated: ${note.question?.slice(0, 30)}` });
    await app.save();
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/** Delete an interview note */
exports.deleteNote = async (req, res) => {
  const { appId, noteId } = req.params;
  try {
    const app = await Application.findOne({ _id: appId, user: req.user.id });
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    app.interviewNotes = app.interviewNotes.filter(n => n._id.toString() !== noteId);
    app.activityLog.push({ action: 'Interview note removed' });
    await app.save();
    res.json({ msg: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

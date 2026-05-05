const Application = require('../models/Application');
const { getDemoApplicationById, getDemoApplications, isDemoUserId } = require('../config/demoData');

const UPDATABLE_FIELDS = [
  'company',
  'role',
  'status',
  'deadline',
  'interviewDate',
  'jobLink',
  'jobDescription',
  'salary',
  'notes',
];

const toIsoOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

exports.getApplications = async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      return res.json(getDemoApplications(req.user.id));
    }

    const applications = await Application.find({ user: req.user.id }).sort({ appliedDate: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      const application = getDemoApplicationById(req.user.id, req.params.id);
      if (!application) return res.status(404).json({ msg: 'Application not found' });
      return res.json(application);
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createApplication = async (req, res) => {
  const { company, role, status, deadline, interviewDate, jobLink, jobDescription, salary, notes } = req.body;
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo applications are read-only in demo mode.' });
    }

    const activityLog = [{ action: `Application created with status: ${status || 'applied'}` }];
    if (deadline) {
      activityLog.push({ action: `Application deadline set to ${new Date(deadline).toLocaleString()}` });
    }
    if (interviewDate) {
      activityLog.push({ action: `Interview scheduled for ${new Date(interviewDate).toLocaleString()}` });
    }

    const application = new Application({
      user: req.user.id,
      company,
      role,
      status: status || 'applied',
      deadline: deadline || undefined,
      interviewDate: interviewDate || undefined,
      jobLink,
      jobDescription,
      salary,
      notes,
      activityLog,
    });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo applications are read-only in demo mode.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const prevStatus = application.status;
    const prevDeadlineIso = toIsoOrNull(application.deadline);
    const prevInterviewIso = toIsoOrNull(application.interviewDate);

    UPDATABLE_FIELDS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        const val = req.body[key];
        if (key === 'deadline' || key === 'interviewDate') {
          application[key] = val === '' || val === null || val === undefined ? undefined : new Date(val);
        } else {
          application[key] = val;
        }
      }
    });

    if (Object.prototype.hasOwnProperty.call(req.body, 'status') && req.body.status !== prevStatus) {
      application.activityLog.push({
        action: `Status changed from ${prevStatus} to ${req.body.status}`,
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'deadline')) {
      const nextIso = toIsoOrNull(req.body.deadline === '' ? null : req.body.deadline);
      if (nextIso !== prevDeadlineIso) {
        application.activityLog.push({
          action: nextIso
            ? `Application deadline set to ${new Date(nextIso).toLocaleString()}`
            : 'Application deadline cleared',
        });
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'interviewDate')) {
      const nextIso = toIsoOrNull(req.body.interviewDate === '' ? null : req.body.interviewDate);
      if (nextIso !== prevInterviewIso) {
        application.activityLog.push({
          action: nextIso
            ? `Interview scheduled for ${new Date(nextIso).toLocaleString()}`
            : 'Interview date cleared',
        });
      }
    }

    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo applications are read-only in demo mode.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Application.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Application removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addInterviewNote = async (req, res) => {
  const { question, answer, feedback } = req.body;
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo applications are read-only in demo mode.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    application.interviewNotes.push({ question, answer, feedback });
    const preview = (question || 'Note').slice(0, 80);
    application.activityLog.push({ action: `Interview note added: ${preview}${(question && question.length > 80) ? '…' : ''}` });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateInterviewNote = async (req, res) => {
  const { question, answer, feedback } = req.body;
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo applications are read-only in demo mode.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const note = application.interviewNotes.id(req.params.noteId);
    if (!note) return res.status(404).json({ msg: 'Note not found' });

    if (question !== undefined) note.question = question;
    if (answer !== undefined) note.answer = answer;
    if (feedback !== undefined) note.feedback = feedback;

    application.activityLog.push({ action: 'Interview note updated' });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteInterviewNote = async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo applications are read-only in demo mode.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    application.interviewNotes = application.interviewNotes.filter(
      (note) => note._id.toString() !== req.params.noteId
    );
    application.activityLog.push({ action: 'Interview note removed' });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
const mongoose = require('mongoose');

const interviewNoteSchema = new mongoose.Schema({
  question: String,
  answer: String,
  feedback: String,
  date: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  jobLink: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  salary: { type: String, default: '' },
  status: {
    type: String,
    enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
    default: 'applied',
  },
  appliedDate: { type: Date, default: Date.now },
  deadline: Date,
  interviewDate: Date,
  notes: String,
  resumeVersion: String,
  linkedResume: String,
  documents: [String],
  activityLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
  }],
  interviewNotes: [interviewNoteSchema],
  aiFeedback: {
    resumeReview: String,
    jobMatch: String,
    coverLetter: String,
    interviewQuestions: [String],
  },
});

module.exports = mongoose.model('Application', applicationSchema);
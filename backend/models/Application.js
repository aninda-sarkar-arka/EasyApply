const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['applied', 'interview', 'offer', 'rejected'], default: 'applied' },
  appliedDate: { type: Date, default: Date.now },
  deadline: Date,
  interviewDate: Date,
  notes: String,
  resumeVersion: String,
  documents: [String], // file paths
  activityLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
  }],
  aiFeedback: {
    resumeReview: String,
    jobMatch: String,
    coverLetter: String,
    interviewQuestions: [String],
  },
});

module.exports = mongoose.model('Application', applicationSchema);
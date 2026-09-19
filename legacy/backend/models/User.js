const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    education: [{
      degree: String,
      institution: String,
      year: Number,
    }],
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
    }],
    preferredRoles: [String],
    jobLocations: [String],
    resume: String,
  },
  resumes: [{
    filename: String,
    originalName: String,
    uploadDate: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
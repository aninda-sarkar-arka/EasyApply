const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOC/DOCX files are allowed'), false);
  }
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    user.resumes.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
    await user.save();

    res.json({
      msg: 'Resume uploaded successfully',
      resume: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        uploadDate: new Date(),
      },
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resumes');
    res.json(user.resumes || []);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const resume = user.resumes.find((r) => r._id.toString() === req.params.id);
    if (!resume) return res.status(404).json({ msg: 'Resume not found' });

    // Delete file from disk
    const filepath = path.join(__dirname, '..', 'uploads', resume.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    user.resumes = user.resumes.filter((r) => r._id.toString() !== req.params.id);
    await user.save();
    res.json({ msg: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const filepath = path.join(__dirname, '..', 'uploads', req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ msg: 'File not found' });
    }
    res.download(filepath);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

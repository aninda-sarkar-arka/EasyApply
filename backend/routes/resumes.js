const express = require('express');
const { uploadResume, getResumes, deleteResume, downloadResume, upload } = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/', auth, getResumes);
router.delete('/:id', auth, deleteResume);
router.get('/download/:filename', auth, downloadResume);

module.exports = router;

const express = require('express');
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addInterviewNote,
  updateInterviewNote,
  deleteInterviewNote,
} = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getApplications);
router.get('/:id', auth, getApplicationById);
router.post('/', auth, createApplication);
router.put('/:id', auth, updateApplication);
router.delete('/:id', auth, deleteApplication);

// Interview notes
router.post('/:id/interview-notes', auth, addInterviewNote);
router.put('/:id/interview-notes/:noteId', auth, updateInterviewNote);
router.delete('/:id/interview-notes/:noteId', auth, deleteInterviewNote);

module.exports = router;
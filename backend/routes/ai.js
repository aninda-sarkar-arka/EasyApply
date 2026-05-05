const express = require('express');
const {
  health,
  resumeReview,
  jobMatch,
  improveBullet,
  generateCoverLetter,
  generateInterviewQuestions,
} = require('../controllers/aiController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/health', health);

router.post('/resume-review', auth, resumeReview);
router.post('/job-match', auth, jobMatch);
router.post('/improve-bullet', auth, improveBullet);
router.post('/cover-letter', auth, generateCoverLetter);
router.post('/interview-questions', auth, generateInterviewQuestions);

module.exports = router;
const express = require('express');
const { getApplications, createApplication, updateApplication, deleteApplication } = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getApplications);
router.post('/', auth, createApplication);
router.put('/:id', auth, updateApplication);
router.delete('/:id', auth, deleteApplication);

module.exports = router;
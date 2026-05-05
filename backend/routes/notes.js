const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const noteCtrl = require('../controllers/noteController');

// Get all notes for logged‑in user
router.get('/', auth, noteCtrl.getAllNotes);

// Create a note for a specific application
router.post('/:appId', auth, noteCtrl.createNote);

// Update a note (appId + noteId)
router.put('/:appId/:noteId', auth, noteCtrl.updateNote);

// Delete a note
router.delete('/:appId/:noteId', auth, noteCtrl.deleteNote);

module.exports = router;

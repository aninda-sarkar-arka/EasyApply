const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { findDemoUserById, isDemoUserId } = require('../config/demoData');
const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      const demoUser = findDemoUserById(req.user.id);
      if (!demoUser) return res.status(404).json({ msg: 'User not found' });
      const { password, ...safeUser } = demoUser;
      return res.json(safeUser);
    }

    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    if (isDemoUserId(req.user.id)) {
      return res.status(400).json({ msg: 'Demo user profiles are read-only in demo mode.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
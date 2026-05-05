const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ msg: 'Database is unavailable. Please verify MongoDB is running and try again.' });
    }

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required.' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Strong password validation: >8 chars, >=1 lowercase, >=1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{9,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ msg: 'Password must be more than 8 characters, contain at least one lowercase letter, and one special character.' });
    }

    const derivedName = name?.trim() || email.split('@')[0];
    user = new User({ name: derivedName, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ msg: 'Server auth configuration is missing JWT_SECRET.' });
    }

    jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
      if (err) return res.status(500).json({ msg: 'Failed to create authentication token.' });
      res.json({ token });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ msg: 'Server auth configuration is missing JWT_SECRET.' });
    }


    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ msg: 'Database is unavailable. Please verify MongoDB is running and try again.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
      if (err) return res.status(500).json({ msg: 'Failed to create authentication token.' });
      res.json({ token });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};